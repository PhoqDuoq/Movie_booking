import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  movie_code: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre: string;

  @Column({ type: 'int' })
  duration_mins: number;

  @Column({ type: 'date' })
  release_date: Date;

  @Column({ type: 'varchar', length: 20, default: 'NOW_SHOWING' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  poster_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tagline: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @Column({ type: 'varchar', length: 5, default: 'P' })
  age_rating: string;

  @Column({ type: 'varchar', length: 50, default: 'Tiếng Việt' })
  language: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  backdrop_url: string;

  @Column({ type: 'varchar', length: 20, default: '#000000' })
  trailer_color: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  director: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cast_members: string;
}
