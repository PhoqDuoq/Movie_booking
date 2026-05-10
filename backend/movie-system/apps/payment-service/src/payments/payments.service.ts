import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Booking, Payment } from '@app/shared';

@Injectable()
export class PaymentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy,
  ) {}

  async createPaymentUrl(userId: string, bookingId: string, provider: string) {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId, user_id: userId } });
    
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(`Không thể thanh toán đơn hàng có trạng thái: ${booking.status}`);
    }

    // Tạo bản ghi Payment
    const payment = this.paymentRepository.create({
      booking_id: booking.id,
      provider: provider,
      amount: booking.total_amount,
      status: 'PENDING',
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Giả lập trả về URL của cổng thanh toán
    const mockPaymentUrl = `http://localhost:3000/api/payments/mock-gateway?paymentId=${savedPayment.id}&amount=${savedPayment.amount}&provider=${provider}`;

    return {
      message: 'Tạo link thanh toán thành công',
      payment_id: savedPayment.id,
      payment_url: mockPaymentUrl,
    };
  }

  async processWebhook(paymentId: string, status: string) {
    if (status !== 'SUCCESS' && status !== 'FAILED') {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let eventEmitted = false;
    let paymentBookingId = null;

    try {
      const payment = await queryRunner.manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) {
        throw new NotFoundException('Không tìm thấy giao dịch');
      }

      if (payment.status !== 'PENDING') {
        throw new BadRequestException('Giao dịch này đã được xử lý');
      }

      paymentBookingId = payment.booking_id;

      // 1. Cập nhật trạng thái Payment
      payment.status = status;
      payment.provider_trans_id = `MOCK_TRANS_${Date.now()}`;
      await queryRunner.manager.save(payment);

      // 2. Cập nhật trạng thái Booking nếu thanh toán thành công
      if (status === 'SUCCESS') {
        const booking = await queryRunner.manager.findOne(Booking, { where: { id: payment.booking_id } });
        if (booking) {
          booking.status = 'COMPLETED';
          await queryRunner.manager.save(booking);
          eventEmitted = true; // Flag to emit event later
        }
      } else if (status === 'FAILED') {
        const booking = await queryRunner.manager.findOne(Booking, { where: { id: payment.booking_id } });
        if (booking) {
          booking.status = 'FAILED';
          await queryRunner.manager.save(booking);
        }
      }

      await queryRunner.commitTransaction();

      // Emit event after transaction is successfully committed
      if (eventEmitted && paymentBookingId) {
        this.redisClient.emit('PAYMENT_SUCCESS', { bookingId: paymentBookingId });
      }

      return {
        message: 'Xử lý webhook thành công',
        payment_status: status,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi xử lý giao dịch');
    } finally {
      await queryRunner.release();
    }
  }
}
