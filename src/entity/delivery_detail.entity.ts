import { Money } from 'src/entity/money.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OneToOne } from 'typeorm/decorator/relations/OneToOne';
import { FactoryTemplate } from './factory.template';
import { DropOffPoint } from './drop_off_point.entity';
import { Product } from './product.entity';
import { Transportation_Car } from './transport_car.entity';

@Entity({ name: 'delivery_detail' })
export class DeliveryDetail extends FactoryTemplate {
  // @Column()
  // delivery_id: number

  @Column()
  drop_id: number;

  @Column()
  ice_id: number;

  @Column()
  amount: number;

  @Column()
  price: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  delivery_status: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  delivery_date: Date;

  @Column({ nullable: true })
  car_id: number;

  @ManyToOne(
    () => DropOffPoint,
    (dropOffPoint) => dropOffPoint.delivery_details,
  )
  @JoinColumn({ name: 'drop_id' })
  dropoffpoint: DropOffPoint;

  @ManyToOne(() => Product, (product) => product.delivery_details)
  @JoinColumn({ name: 'ice_id' })
  product: Product;

  @OneToOne(() => Money, (money) => money.delivery_details)
  money: Money;

  @ManyToOne(() => Transportation_Car, (car) => car.delivery_details)
  @JoinColumn({ name: 'car_id' })
  car: Transportation_Car; // ✅ เพิ่ม field car
}
