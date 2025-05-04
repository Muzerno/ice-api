import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { Product } from './product.entity';
import { Transportation_Car } from './transport_car.entity';

@Entity({ name: 'loading' })
export class Loading extends FactoryTemplate {
  @Column()
  load_balance: number;

  @Column()
  car_id: number;

  @Column()
  ice_id: number;

  // @OneToMany(() => Product, (product) => product.loading)
  @JoinColumn({ name: 'ice_id' })
  products: Product[];

  @OneToOne(
    () => Transportation_Car,
    (transportation_car) => transportation_car.loading,
  )
  @JoinColumn({ name: 'car_id' })
  transportation_car: Transportation_Car;
}
