import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Withdraw } from './withdraw.entity';

@Entity({ name: 'withdraw_detail' })
export class WithdrawDetail {
  @PrimaryColumn()
  ice_id: number;

  @PrimaryColumn()
  withdraw_id: number;

  @Column()
  amount: number;

  @ManyToOne(() => Product, (product) => product.withdraw_details)
  @JoinColumn({ name: 'ice_id' })
  product: Product;

  @ManyToOne(() => Withdraw, (withdraw) => withdraw.withdraw_details)
  @JoinColumn({ name: 'withdraw_id' })
  withdraw: Withdraw;
}
