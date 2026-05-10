import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { Seat, Showtime, BookingSeat } from '@app/shared';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Showtime, BookingSeat])],
  controllers: [SeatsController],
  providers: [SeatsService],
})
export class SeatsModule {}
