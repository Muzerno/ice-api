import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Loading } from "./loading.entity";
import { ManufactureDetail } from "./manufacture_detail.entity";
import { WithdrawDetail } from "./withdraw_detail.entity";
import { OrderCustomer } from "./order_customer.entity";
import { OrderCustomerDetail } from "./order_customer_detail.entity";
import { StockCar } from "./stock_car.entity";
import { DeliveryDetail } from "./delivery_detail.entity";
@Entity({ name: "ice" })
export class Product {

    @PrimaryColumn()
    ice_id: string

    @Column()
    name: string

    @Column()
    price: number

    @Column()
    amount: number

    @OneToMany(() => ManufactureDetail, manufactureDetail => manufactureDetail.products)
    manufacture_detail: ManufactureDetail[]

    @OneToMany(() => WithdrawDetail, withdrawDetail => withdrawDetail.product)
    withdraw_details: WithdrawDetail[]

    // @ManyToOne(() => OrderCustomerDetail, orderCustomer => orderCustomer.product)
    // order_customer_details: OrderCustomer

    // @ManyToOne(() => StockCar, stockCar => stockCar.product)
    // stock_car: StockCar

    @OneToMany(() => DeliveryDetail, deliveryDetail => deliveryDetail.product)
    delivery_details: DeliveryDetail[]
}
