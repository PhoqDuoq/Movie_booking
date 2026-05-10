import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Booking, Showtime, Movie } from '@app/shared';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Showtime) private showtimeRepository: Repository<Showtime>,
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
  ) {}

  async sendTicketEmail(bookingId: string) {
    try {
      const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
      if (!booking) {
        this.logger.error(`Booking ${bookingId} not found`);
        return;
      }

      const user = await this.userRepository.findOne({ where: { id: booking.user_id } });
      if (!user) {
        this.logger.error(`User ${booking.user_id} not found`);
        return;
      }

      const showtime = await this.showtimeRepository.findOne({ where: { id: booking.showtime_id } });
      let movieTitle = 'Unknown Movie';
      if (showtime) {
        const movie = await this.movieRepository.findOne({ where: { id: showtime.movie_id } });
        if (movie) movieTitle = movie.title;
      }

      // Giả lập tạo mã QR
      const qrCodeData = `QR_TICKET_${booking.id}_${Date.now()}`;

      // Giả lập gửi Email
      this.logger.log('==================================================');
      this.logger.log(`📧 ĐANG GỬI EMAIL TỚI: ${user.email}`);
      this.logger.log(`TIÊU ĐỀ: Vé điện tử xem phim ${movieTitle}`);
      this.logger.log('NỘI DUNG:');
      this.logger.log(`Cảm ơn bạn đã đặt vé. Đây là mã QR vé điện tử của bạn:`);
      this.logger.log(`[ ${qrCodeData} ]`);
      this.logger.log(`Tổng tiền thanh toán: ${booking.total_amount} VND`);
      this.logger.log('Vui lòng đưa mã QR này cho nhân viên soát vé tại rạp.');
      this.logger.log('==================================================');

    } catch (error) {
      this.logger.error(`Failed to send email for booking ${bookingId}: ${error.message}`);
    }
  }
}
