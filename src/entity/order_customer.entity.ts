import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Line } from "./transportation.entity";
import { DropOffPoint } from "./drop_off_point.entity";
import { Transportation_Car } from "./transport_car.entity";
import { Product } from "./product.entity";
import { OrderCustomerDetail } from "./order_customer_detail.entity";
@Entity()
export class OrderCustomer extends FactoryTemplate {

    @Column({ length: 50 })
    name: string

    @Column({ length: 10 })
    telephone: string

    @Column({ length: 50 })
    latitude: string

    @Column({ length: 50 })
    longitude: string

    @Column({ type: "text" })
    address: string

    @Column({ nullable: true })
    car_id: number

    @OneToMany(() => OrderCustomerDetail, orderCustomerDetail => orderCustomerDetail.order_customer, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    order_customer_details: OrderCustomerDetail[]

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.customer_orders)
    @JoinColumn({ name: "car_id" })
    transportation_car: Transportation_Car

    @OneToMany(() => DropOffPoint, dropOffPoint => dropOffPoint.customer_order, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    dropOffPoints: DropOffPoint[]

}
