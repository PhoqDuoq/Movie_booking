import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking, BookingSeat, Seat, Showtime } from '@app/shared';
import Redis from 'ioredis';

@Injectable()
export class BookingsService {
  private redisClient: Redis;

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Showtime) private showtimeRepository: Repository<Showtime>,
    @InjectRepository(Seat) private seatRepository: Repository<Seat>,
  ) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async lockSeats(userId: string, showtimeId: string, seatIds: string[]) {
    if (!seatIds || seatIds.length === 0) {
      throw new BadRequestException('Danh sách ghế trống');
    }

    const lockedKeys: string[] = [];
    const TTL = 600; // 10 phút

    try {
      for (const seatId of seatIds) {
        const lockKey = `seat_lock:${showtimeId}:${seatId}`;
        // Lệnh SET với tùy chọn NX (chỉ set nếu chưa tồn tại) và EX (hết hạn sau TTL giây)
        const result = await this.redisClient.set(lockKey, userId, 'EX', TTL, 'NX');
        
        if (result === 'OK') {
          lockedKeys.push(lockKey);
        } else {
          // Nếu có 1 ghế không thể khóa (vì ai đó đã khóa trước), ta phải nhả (unlock) các ghế đã khóa thành công trước đó
          if (lockedKeys.length > 0) {
            await this.redisClient.del(...lockedKeys);
          }
          throw new BadRequestException('Một trong số các ghế bạn chọn đã có người khác đặt. Vui lòng chọn lại.');
        }
      }

      return {
        message: 'Khóa ghế thành công',
        locked_seats: seatIds,
        expires_in_seconds: TTL,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi khóa ghế');
    }
  }

  async confirmBooking(userId: string, showtimeId: string, seatIds: string[]) {
    if (!seatIds || seatIds.length === 0) {
      throw new BadRequestException('Danh sách ghế trống');
    }

    // Xác minh rằng tất cả các ghế này đều đang được khóa bởi chính userId này
    for (const seatId of seatIds) {
      const lockKey = `seat_lock:${showtimeId}:${seatId}`;
      const lockedBy = await this.redisClient.get(lockKey);
      if (lockedBy !== userId) {
        throw new BadRequestException(`Ghế ${seatId} đã hết thời gian giữ chỗ hoặc không thuộc về bạn.`);
      }
    }

    // Bắt đầu DB Transaction để tạo đơn hàng
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Giả sử mỗi ghế đồng giá 80,000 VND (Trong thực tế cần lấy giá từ logic rạp)
      const seatPrice = 80000;
      const totalAmount = seatPrice * seatIds.length;

      // 1. Tạo Booking
      const booking = queryRunner.manager.create(Booking, {
        user_id: userId,
        showtime_id: showtimeId,
        total_amount: totalAmount,
        status: 'PENDING', // Đổi thành PENDING đợi thanh toán
      });
      const savedBooking = await queryRunner.manager.save(booking);

      // 2. Tạo BookingSeat
      const bookingSeats = seatIds.map(seatId => {
        return queryRunner.manager.create(BookingSeat, {
          booking_id: savedBooking.id,
          seat_id: seatId,
          price: seatPrice,
        });
      });
      await queryRunner.manager.save(bookingSeats);

      // 3. Xóa Lock trong Redis sau khi đã lưu DB thành công
      const keysToDelete = seatIds.map(seatId => `seat_lock:${showtimeId}:${seatId}`);
      await this.redisClient.del(...keysToDelete);

      await queryRunner.commitTransaction();

      return {
        message: 'Đặt vé thành công',
        booking_id: savedBooking.id,
        total_amount: totalAmount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Lỗi hệ thống khi lưu đơn hàng');
    } finally {
      await queryRunner.release();
    }
  }
}
