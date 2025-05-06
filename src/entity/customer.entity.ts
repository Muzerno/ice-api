import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { Line } from './transportation.entity';
import { DropOffPoint } from './drop_off_point.entity';
import { NormalPoint } from './normal_point.entity';

@Entity()
export class Customer {
  @PrimaryColumn({ type: 'int' })
  customer_id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10 })
  telephone: string;

  @Column({ length: 50 })
  latitude: string;

  @Column({ length: 50 })
  longitude: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: 0 })
  type_cus: number;

  @OneToMany(() => NormalPoint, (normalPoint) => normalPoint.customer)
  normalPoints: NormalPoint[];

  @OneToMany(() => DropOffPoint, (dropOffPoint) => dropOffPoint.customer)
  drop_off_points: DropOffPoint[];
}
