import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { OrderCustomer } from "./order_customer.entity";
import { Product } from "./product.entity";

@Entity()
export class OrderCustomerDetail extends FactoryTemplate {

    @Column()
    amount: number;

    @Column()
    product_id: number;

    @Column()
    order_customer_id: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createAt: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updateAt: Date

    @ManyToOne(() => OrderCustomer, orderCustomer => orderCustomer.order_customer_details, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "order_customer_id" })
    order_customer: OrderCustomer;

    @ManyToOne(() => Product, product => product.order_customer_details)
    @JoinColumn({ name: "product_id" })
    product: Product;
}
