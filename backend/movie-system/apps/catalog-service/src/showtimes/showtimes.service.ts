import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Showtime } from '@app/shared';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private showtimeRepository: Repository<Showtime>,
  ) {}

  async findAll(movieId?: string, date?: string): Promise<Showtime[]> {
    
    const qb = this.showtimeRepository.createQueryBuilder('s')
      .select([
        's.id as id',
        's.movie_id as movie_id',
        's.room_id as room_id',
        's.start_time as start_time',
        's.end_time as end_time',
        's.base_price as base_price',
        'r.complex_id as theater_id',
        'r.room_type as format'
      ])
      .innerJoin('rooms', 'r', 'r.id = s.room_id');

    if (movieId) {
      if (movieId.length === 36) {
        qb.andWhere('s.movie_id = :movieId', { movieId });
      } else {
        qb.innerJoin('movies', 'm', 'm.id = s.movie_id')
          .andWhere('m.movie_code = :movieId', { movieId });
      }
    }
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      qb.andWhere('s.start_time BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return qb.orderBy('s.start_time', 'ASC').getRawMany();

  }
}
