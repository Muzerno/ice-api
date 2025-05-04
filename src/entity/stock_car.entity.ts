import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { WithdrawDetail } from './withdraw_detail.entity';
import { Product } from './product.entity';

@Entity({ name: 'stock_in_car' })
@Unique(['car_id', 'ice_id'])
export class StockCar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ice_id: number;

  @Column()
  amount: number;

  @Column()
  car_id: number;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // createAt: Date;

  // @OneToMany(() => Product, (product) => product.stock_car)
  @JoinColumn({ name: 'product_id' })
  product: Product[];
}
