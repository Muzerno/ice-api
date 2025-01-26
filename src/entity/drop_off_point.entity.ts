import { Column, Entity, Generated, JoinColumn, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Customer } from "./customer.entity";
import { OrderCustomer } from "./order_customer.entity";
import { Line } from "./transportation.entity";
import { Transportation_Car } from "./transport_car.entity";

@Entity({ name: "drop_off_point" })
export class DropOffPoint extends FactoryTemplate {

    @Generated("increment")
    drop_no: number;

    @Column({ nullable: true })
    drop_status: string;

    @Column({ nullable: true })
    latitude: string;

    @Column({ nullable: true })
    longitude: string;

    @Column({ nullable: true })
    customer_id: number

    @Column({ nullable: true })
    customer_order_id: number

    @Column({ nullable: true })
    line_id: number

    @Column({ nullable: true })
    car_id: number

    @ManyToOne(() => Line, line => line.dropOffPoints, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "line_id" })
    line: Line

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.dropOffPoints)
    @JoinColumn({ name: "car_id" })
    car: Transportation_Car

    @Column({ type: "enum", enum: ["dayly", "order"] })
    drop_type: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createAt: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updateAt: Date

    @ManyToOne(() => Customer, customer => customer.drop_off_points)
    @JoinColumn({ name: "customer_id" })
    customer: Customer


    @ManyToOne(() => OrderCustomer, orderCustomer => orderCustomer.dropOffPoints, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "customer_order_id" })
    customer_order: OrderCustomer
}