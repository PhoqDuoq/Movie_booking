import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  movie_id: string;

  @Column({ type: 'uuid' })
  room_id: string;

  @Column({ type: 'datetime' })
  start_time: Date;

  @Column({ type: 'datetime' })
  end_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;
}
