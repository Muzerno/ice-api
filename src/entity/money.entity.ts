import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Line } from './transportation.entity';

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
}
