import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Manufacture } from './manufacture.entit.entity';
import { Product } from './product.entity';

@Entity({ name: 'manufacture_detail' })
export class ManufactureDetail {
  @PrimaryColumn()
  ice_id: number;

  @PrimaryColumn()
  manufacture_id: number;

  @Column()
  manufacture_amount: number;

  @ManyToOne(() => Product, (product) => product.manufacture_detail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ice_id' })
  products: Product;

  @ManyToOne(
    () => Manufacture,
    (manufacture) => manufacture.manufacture_details,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'manufacture_id' })
  manufacture: Manufacture;
}
