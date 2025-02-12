import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Loading } from "./loading.entity";
import { ManufactureDetail } from "./manufacture_detail.entity";
import { WithdrawDetail } from "./withdraw_detail.entity";
import { OrderCustomer } from "./order_customer.entity";
import { OrderCustomerDetail } from "./order_customer_detail.entity";
import { StockCar } from "./stock_car.entity";
@Entity({ name: "ice" })
export class Product extends FactoryTemplate {

    @Column()
    name: string

    @Column()
    price: number

    @Column()
    amount: number

    @ManyToOne(() => Loading, loading => loading.products)

    loading: Loading

    @OneToMany(() => ManufactureDetail, manufactureDetail => manufactureDetail.products)
    manufacture_detail: ManufactureDetail[]

    @OneToMany(() => WithdrawDetail, withdrawDetail => withdrawDetail.product)
    withdraw_details: WithdrawDetail[]

    @ManyToOne(() => OrderCustomerDetail, orderCustomer => orderCustomer.product)
    order_customer_details: OrderCustomer

    @ManyToOne(() => StockCar, stockCar => stockCar.product)
    stock_car: StockCar
}
