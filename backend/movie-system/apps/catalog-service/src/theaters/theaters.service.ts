import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterComplex } from '@app/shared';

@Injectable()
export class TheatersService {
  constructor(
    @InjectRepository(TheaterComplex)
    private theaterRepository: Repository<TheaterComplex>,
  ) {}

  async findAll(): Promise<TheaterComplex[]> {
    return this.theaterRepository.find();
  }
}
