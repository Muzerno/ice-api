import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { Withdraw } from './withdraw.entity';
import { Product } from './product.entity';
import { StockCar } from './stock_car.entity';

@Entity({ name: 'withdraw_detail' })
export class WithdrawDetail extends FactoryTemplate {
  // @Column()
  // date_time: Date

  @Column()
  amount: number;

  @Column()
  ice_id: number;

  @Column()
  withdraw_id: number;

  @ManyToOne(() => Withdraw, (withdraw) => withdraw.withdraw_details)
  @JoinColumn({ name: 'withdraw_id' })
  withdraw: Withdraw;

  @ManyToOne(() => Product, (product) => product.withdraw_details)
  @JoinColumn({ name: 'ice_id' })
  product: Product;
}
