import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Customer } from './customer.entity';
import { Line } from './transportation.entity';
import { Transportation_Car } from './transport_car.entity';
import { DeliveryDetail } from './delivery_detail.entity';

@Entity({ name: 'drop_off_point' })
export class DropOffPoint {
  @PrimaryGeneratedColumn('increment')
  drop_id: number;

  @Column({ nullable: true })
  drop_status: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: true })
  customer_id: number;

  @Column({ nullable: true })
  line_id: number;

  @Column({ nullable: true })
  car_id: number;

  @ManyToOne(() => Line, (line) => line.dropOffPoints, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'line_id' })
  line: Line;

  @ManyToOne(
    () => Transportation_Car,
    (transportation_car) => transportation_car.dropOffPoints,
  )
  @JoinColumn({ name: 'car_id' })
  car: Transportation_Car;

  @Column({ type: 'enum', enum: ['dayly', 'order'] })
  drop_type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_drop: Date;

  @ManyToOne(() => Customer, (customer) => customer.drop_off_points)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(
    () => DeliveryDetail,
    (deliveryDetail) => deliveryDetail.dropoffpoint,
  )
  delivery_details: DeliveryDetail[];
}
