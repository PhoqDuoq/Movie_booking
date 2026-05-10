import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('booking_seats')
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  booking_id: string;

  @Column({ type: 'uuid' })
  seat_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: false })
  is_refunded: boolean;
}
