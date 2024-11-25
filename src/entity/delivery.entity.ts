import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { DeliveryDetail } from "./delivery_detail.entity";
import { Money } from "./money.entity";

@Entity()
export class Delivery extends FactoryTemplate {

    @Column()
    date_time: Date

    @Column()
    status: boolean

    @Column()
    user_id: number

    @Column()
    car_id: number

    @OneToMany(() => DeliveryDetail, deliveryDetail => deliveryDetail.delivery)
    delivery_details: DeliveryDetail[]

    @OneToOne(() => Money, money => money.delivery)
    money: Money
}