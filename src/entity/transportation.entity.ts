import { Column, Entity, Generated, JoinColumn, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";
import { Transportation_Car } from "./transport_car.entity";
import { Customer } from "./customer.entity";

@Entity({ name: "line" })
export class Line extends FactoryTemplate {

    @Column()
    customer_id: number

    @Generated("increment")
    number: number

    @Column({ nullable: true })
    car_id: number

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.Lines)
    @JoinColumn({ name: "car_id" })
    transportation_car: Transportation_Car

    @ManyToOne(() => Customer, customer => customer.Lines)
    @JoinColumn({ name: "customer_id" })
    customer: Customer
}