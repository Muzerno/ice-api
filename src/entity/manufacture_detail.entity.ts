import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { Manufacture } from './manufacture.entit.entity';
import { Product } from './product.entity';

@Entity({ name: 'manufacture_detail' })
export class ManufactureDetail extends FactoryTemplate {
  @Column()
  manufacture_amount: number;

  // @Column()
  // date_time: Date

  @Column()
  ice_id: number;

  @Column()
  manufacture_id: number;

  @ManyToOne(() => Product, (product) => product.manufacture_detail)
  @JoinColumn({ name: 'ice_id' })
  products: Product[];

  @ManyToOne(
    () => Manufacture,
    (manufacture) => manufacture.manufacture_details,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'manufacture_id' })
  manufacture: Manufacture;
}
