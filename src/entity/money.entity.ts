import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { FactoryTemplate } from './factory.template';
import { DeliveryDetail } from './delivery_detail.entity';

@Entity({ name: 'money' })
export class Money extends FactoryTemplate {
  @Column()
  date_time: Date;

  // @Column()
  // dateString: string;

  @Column()
  amount: number;

  @Column()
  delivery_id: number;

  @OneToOne(() => DeliveryDetail, (delivery_details) => delivery_details.money)
  @JoinColumn({ name: 'delivery_id' }) // ฝั่งนี้ถือ foreign key
  delivery_details: DeliveryDetail;
}
