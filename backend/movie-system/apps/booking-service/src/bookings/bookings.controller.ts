import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('lock')
  async lockSeats(
    @Req() req: any,
    @Body('showtimeId') showtimeId: string,
    @Body('seatIds') seatIds: string[],
  ) {
    const userId = req.user.userId;
    return this.bookingsService.lockSeats(userId, showtimeId, seatIds);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('confirm')
  async confirmBooking(
    @Req() req: any,
    @Body('showtimeId') showtimeId: string,
    @Body('seatIds') seatIds: string[],
  ) {
    const userId = req.user.userId;
    return this.bookingsService.confirmBooking(userId, showtimeId, seatIds);
  }
}
