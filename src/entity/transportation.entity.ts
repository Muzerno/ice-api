import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";
import { Transportation_Car } from "./transport_car.entity";
import { Customer } from "./customer.entity";
import { DropOffPoint } from "./drop_off_point.entity";

@Entity({ name: "line" })
export class Line extends FactoryTemplate {

    @Column()
    customer_id: number

    @Generated("increment")
    number: number

    @Column()
    line_name: string

    @Column({ nullable: true })
    car_id: number

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.Lines)
    @JoinColumn({ name: "car_id" })
    transportation_car: Transportation_Car

    @ManyToOne(() => Customer, customer => customer.Lines)
    @JoinColumn({ name: "customer_id" })
    customer: Customer

    @OneToMany(() => DropOffPoint, dropOffPoint => dropOffPoint.line)
    dropOffPoints: DropOffPoint[]
}