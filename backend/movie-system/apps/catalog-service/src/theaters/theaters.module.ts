import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheatersService } from './theaters.service';
import { TheatersController } from './theaters.controller';
import { TheaterComplex, Room } from '@app/shared';

@Module({
  imports: [TypeOrmModule.forFeature([TheaterComplex, Room])],
  controllers: [TheatersController],
  providers: [TheatersService],
})
export class TheatersModule {}
