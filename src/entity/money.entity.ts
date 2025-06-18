import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Line } from './transportation.entity';
import { DeliveryDetail } from './delivery_detail.entity';
import { DropOffPoint } from './drop_off_point.entity';

@Entity({ name: 'money' })
export class Money {
  @PrimaryGeneratedColumn('increment')
  money_id: number;

  @Column()
  date_time: Date;

  @Column()
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';

  @Column({ nullable: true })
  line_id: number;

  @Column({ nullable: true })
  drop_id: number;

  @ManyToOne(() => Line, (line) => line.moneyRecords, { nullable: true })
  @JoinColumn({ name: 'line_id' })
  line: Line;

  @ManyToOne(() => DropOffPoint, (drop) => drop.moneyRecords)
  @JoinColumn({ name: 'drop_id' })
  drop: DropOffPoint;

  @OneToMany(() => DeliveryDetail, (detail) => detail.money)
  delivery_details: DeliveryDetail[];
}
