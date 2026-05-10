import { Controller, Get, Query } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get()
  async findAll(
    @Query('movieId') movieId?: string,
    @Query('date') date?: string,
  ) {
    return this.showtimesService.findAll(movieId, date);
  }
}
