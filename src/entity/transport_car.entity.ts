import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";
import { User } from "./user.entity";
import { Line } from "./transportation.entity";
import { Loading } from "./loading.entity";
import { Withdraw } from "./withdraw.entity";
import { OrderCustomer } from "./order_customer.entity";
import { DropOffPoint } from "./drop_off_point.entity";
import { Delivery } from "./delivery.entity";

@Entity({ name: "car" })
export class Transportation_Car extends FactoryTemplate {

    @Column()
    car_number: string

    @Column({ nullable: true })
    key_api: string

    @Column()
    user_id: number

    @OneToOne(() => User, user => user.transportation_car)
    @JoinColumn({ name: "user_id" })
    users: User

    @OneToMany(() => Line, Line => Line.transportation_car)
    Lines: Line[]

    @OneToOne(() => Loading, loading => loading.transportation_car)
    loading: Loading

    @OneToMany(() => Withdraw, withdraw => withdraw.transportation_car)
    withdraw: Withdraw

    @OneToMany(() => OrderCustomer, orderCustomer => orderCustomer.transportation_car)
    customer_orders: OrderCustomer[]

    @OneToMany(() => DropOffPoint, dropOffPoint => dropOffPoint.car)
    dropOffPoints: DropOffPoint[]

    @OneToMany(() => Delivery, delivery => delivery.car)
    deliveries: Delivery[]
}