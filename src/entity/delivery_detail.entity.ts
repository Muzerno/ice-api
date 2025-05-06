import { Money } from 'src/entity/money.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OneToOne } from 'typeorm/decorator/relations/OneToOne';
import { DropOffPoint } from './drop_off_point.entity';
import { Product } from './product.entity';
import { Transportation_Car } from './transport_car.entity';
import { PrimaryColumn } from 'typeorm/decorator/columns/PrimaryColumn';
@Entity({ name: 'delivery_detail' })
export class DeliveryDetail {
  @PrimaryColumn()
  drop_id: number;

  @Column()
  ice_id: number;

  @Column()
  amount: number;

  @Column()
  price: number;

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
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'drop_id' })
  dropoffpoint: DropOffPoint;

  @ManyToOne(() => Product, (product) => product.delivery_details)
  @JoinColumn({ name: 'ice_id' })
  product: Product;


  @ManyToOne(() => Transportation_Car, (car) => car.delivery_details)
  @JoinColumn({ name: 'car_id' })
  car: Transportation_Car;
}
