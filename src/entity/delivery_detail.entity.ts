import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Delivery } from "./delivery.entity";

@Entity({ name: "delvery_detail" })
export class DeliveryDetail extends FactoryTemplate {

    @Column()
    delivery_id: number

    @Column()
    drop_id: number

    @Column()
    ice_id: number

    @Column()
    amount: number

    @Column()
    price: number

    @ManyToOne(() => Delivery, delivery => delivery.delivery_details)
    @JoinColumn({ name: "delivery_id" })
    delivery: Delivery
}