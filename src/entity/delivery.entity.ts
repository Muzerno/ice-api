import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { DeliveryDetail } from "./delivery_detail.entity";
import { Money } from "./money.entity";
import { Transportation_Car } from "./transport_car.entity";

@Entity()
export class Delivery extends FactoryTemplate {

    @Column()
    date_time: Date

    @Column()
    delivery_status: string

    @Column()
    car_id: number

    @OneToMany(() => DeliveryDetail, deliveryDetail => deliveryDetail.delivery)
    delivery_details: DeliveryDetail[]

    @OneToOne(() => Money, money => money.delivery)
    money: Money

    @ManyToOne(() => Transportation_Car, car => car.deliveries)
    @JoinColumn({ name: "car_id" })
    car: Transportation_Car
}