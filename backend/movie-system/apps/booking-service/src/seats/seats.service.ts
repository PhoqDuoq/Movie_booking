import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat, Showtime, BookingSeat } from '@app/shared';
import Redis from 'ioredis';

@Injectable()
export class SeatsService {
  private redisClient: Redis;

  constructor(
    @InjectRepository(Seat) private seatRepository: Repository<Seat>,
    @InjectRepository(Showtime) private showtimeRepository: Repository<Showtime>,
    @InjectRepository(BookingSeat) private bookingSeatRepository: Repository<BookingSeat>,
  ) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async getSeatsByShowtime(showtimeId: string) {
    const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });
    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    // Lấy toàn bộ ghế của phòng chiếu
    const seats = await this.seatRepository.find({
      where: { room_id: showtime.room_id },
      order: { row_name: 'ASC', seat_number: 'ASC' },
    });

    // Lấy các ghế đã bán (BookingSeat không bị refund) kết nối với bảng Booking (chỉ lấy trạng thái COMPLETED hoặc PENDING đang xử lý)
    // Để đơn giản, ta truy vấn các BookingSeat thuộc về showtime này.
    // Thực tế cần QueryBuilder join Booking để lấy status, nhưng ở đây giả sử mọi BookingSeat trong DB đều là đã book.
    const bookedSeats = await this.bookingSeatRepository
      .createQueryBuilder('bs')
      .innerJoin('bookings', 'b', 'b.id = bs.booking_id')
      .where('b.showtime_id = :showtimeId', { showtimeId })
      .andWhere('bs.is_refunded = false')
      .andWhere('b.status != :status', { status: 'FAILED' })
      .select('bs.seat_id')
      .getRawMany();

    const bookedSeatIds = bookedSeats.map(bs => bs.seat_id);

    // Kiểm tra Redis xem ghế nào đang bị khóa
    // Định dạng key trong Redis: `seat_lock:${showtimeId}:${seatId}`
    const result = await Promise.all(
      seats.map(async (seat) => {
        let status = 'AVAILABLE';
        if (bookedSeatIds.includes(seat.id)) {
          status = 'BOOKED';
        } else {
          const lockKey = `seat_lock:${showtimeId}:${seat.id}`;
          const isLocked = await this.redisClient.get(lockKey);
          if (isLocked) {
            status = 'LOCKED';
          }
        }
        return {
          ...seat,
          status,
        };
      })
    );

    return result;
  }
}
