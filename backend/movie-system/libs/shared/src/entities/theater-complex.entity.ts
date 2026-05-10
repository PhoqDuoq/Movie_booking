import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('theater_complexes')
export class TheaterComplex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 50, default: 'TP.HCM' })
  city: string;
}
