import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User, Booking, Movie, Showtime } from '@app/shared';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking, Movie, Showtime])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
