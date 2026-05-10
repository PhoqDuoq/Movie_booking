import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  room_id: string;

  @Column({ type: 'varchar', length: 5 })
  row_name: string;

  @Column({ type: 'int' })
  seat_number: number;

  @Column({ type: 'varchar', length: 20, default: 'NORMAL' })
  seat_type: string;
}
