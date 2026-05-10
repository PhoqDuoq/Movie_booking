import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('showtime/:showtimeId')
  async getSeats(@Param('showtimeId') showtimeId: string) {
    return this.seatsService.getSeatsByShowtime(showtimeId);
  }
}
