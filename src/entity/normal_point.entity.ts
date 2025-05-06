import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Line } from './transportation.entity';
import { Customer } from './customer.entity';
import { FactoryTemplate } from './factory.template';

@Entity({ name: 'normal_point' })
export class NormalPoint extends FactoryTemplate {
  @Column({ name: 'line_id' })
  line_id: number;

  @Column({ name: 'cus_id' })
  cus_id: number;

  @ManyToOne(() => Line, (line) => line.normalPoints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'line_id' })
  line: Line;

  @ManyToOne(() => Customer, (customer) => customer.normalPoints)
  @JoinColumn({ name: 'cus_id' })
  customer: Customer;
}
