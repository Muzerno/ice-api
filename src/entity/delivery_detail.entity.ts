import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Delivery } from "./delivery.entity";
import { DropOffPoint } from "./drop_off_point.entity";
import { Product } from "./product.entity";

@Entity({ name: "delivery_detail" })
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

    @ManyToOne(() => DropOffPoint, dropOffPoint => dropOffPoint.delivery_details)
    @JoinColumn({ name: "drop_id" })
    dropoffpoint: DropOffPoint

    @ManyToOne(() => Product, product => product.delivery_details)
    @JoinColumn({ name: "ice_id" })
    product: Product
}

