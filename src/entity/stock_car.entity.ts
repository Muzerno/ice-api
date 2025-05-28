import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Unique,
  PrimaryColumn,
  ManyToOne
} from 'typeorm';
import { WithdrawDetail } from './withdraw_detail.entity';
import { Product } from './product.entity';
import { Transportation_Car } from './transport_car.entity';

@Entity({ name: 'stock_in_car' })
export class StockCar {
  @PrimaryColumn()
  car_id: number;

  @PrimaryColumn()
  ice_id: number;

  @Column()
  amount: number;

  // 🔗 ความสัมพันธ์กับตาราง Car
  @ManyToOne(() => Transportation_Car, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Transportation_Car;

  @ManyToOne(() => Product) // ✅ แก้จาก array เป็น single relation
  @JoinColumn({ name: 'ice_id' })
  product: Product;
}
