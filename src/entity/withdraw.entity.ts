import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WithdrawDetail } from './withdraw_detail.entity';
import { Transportation_Car } from './transport_car.entity';
import { User } from './user.entity';

@Entity({ name: 'withdraw' })
export class Withdraw {
  @PrimaryGeneratedColumn('increment')
  withdraw_id: number;

  @Column()
  date_time: Date;

  @Column()
  user_id: number;

  @Column()
  car_id: number;

  @OneToMany(() => WithdrawDetail, (withdrawDetail) => withdrawDetail.withdraw)
  withdraw_details: WithdrawDetail[];

  @ManyToOne(
    () => Transportation_Car,
    (transportation_car) => transportation_car.withdraw,
  )
  @JoinColumn({ name: 'car_id' })
  transportation_car: Transportation_Car;

  @ManyToOne(() => User, (user) => user.withdraws)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
