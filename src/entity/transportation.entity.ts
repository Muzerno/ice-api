import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { UUID } from 'crypto';
import { Transportation_Car } from './transport_car.entity';
import { Customer } from './customer.entity';
import { DropOffPoint } from './drop_off_point.entity';
import { Withdraw } from './withdraw.entity';
import { NormalPoint } from './normal_point.entity';
import { Money } from './money.entity';

@Entity({ name: 'line' })
export class Line {
  @PrimaryGeneratedColumn('increment', { name: 'line_id' })
  line_id: number;

  @Generated('increment')
  number: number;

  @Column()
  line_name: string;

  @Column({ nullable: true })
  car_id: number;

  @ManyToOne(
    () => Transportation_Car,
    (transportation_car) => transportation_car.Lines,
  )
  @JoinColumn({ name: 'car_id' })
  transportation_car: Transportation_Car;

  @OneToMany(() => Money, (money) => money.line)
  moneyRecords: Money[];

  @OneToMany(() => DropOffPoint, (dropOffPoint) => dropOffPoint.line, {
    onDelete: 'CASCADE',
  })
  dropOffPoints: DropOffPoint[];

  @OneToMany(() => NormalPoint, (normalPoint) => normalPoint.line)
  normalPoints: NormalPoint[];
}
