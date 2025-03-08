import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Delivery } from "./delivery.entity";

@Entity({ name: "money" })
export class Money extends FactoryTemplate {

    @Column()
    date_time: Date

    @Column()
    dateString: string

    @Column()
    amount: number

    @Column()
    delevery_id: number

    @OneToOne(() => Delivery, delivery => delivery.money)
    @JoinColumn({ name: "delevery_id" })
    delivery: Delivery
}