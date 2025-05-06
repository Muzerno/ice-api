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

@Entity({ name: 'money' })
export class Money {
  @PrimaryGeneratedColumn('increment')
  money_id: number;

  @Column()
  date_time: Date;

  @Column()
  amount: number;

  @Column()
  line_id: number;

  @ManyToOne(() => Line, (line) => line.moneyRecords)
  @JoinColumn({ name: 'line_id' })
  line: Line;

  @OneToMany(() => DeliveryDetail, (detail) => detail.money)
  delivery_details: DeliveryDetail[];
}
