import { Column, Entity, Generated, JoinColumn, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";
import { Transportation_Car } from "./transport_car.entity";
import { Customer } from "./customer.entity";

@Entity()
export class Transportation_line extends FactoryTemplate {

    @Column({ nullable: true })
    car_number: string

    @Column()
    customer_uid: UUID

    @Generated("increment")
    number: number

    @Column({ nullable: true })
    car_uuid: UUID

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.transportation_lines)
    @JoinColumn({ name: "car_uuid" })
    transportation_car: Transportation_Car

    @ManyToOne(() => Customer, customer => customer.transportation_lines)
    @JoinColumn({ name: "customer_uid" })
    customer: Customer
}