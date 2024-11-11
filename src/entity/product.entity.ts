import { Column, Entity } from "typeorm";
import { FactoryTemplate } from "./factory.template";
@Entity()
export class Product extends FactoryTemplate {

    @Column()
    product_number:string

    @Column()
    product_name:string

    @Column()
    price:number

    @Column()
    stock:number

}
