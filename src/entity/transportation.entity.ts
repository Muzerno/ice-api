import { Column, Entity, Generated } from "typeorm";
import { FactoryTemplate } from "./factory.template";

@Entity()
export class Transportation_line extends FactoryTemplate {

    @Column()
    car_number: string

    @Column()
    customer_id: number

    @Generated("increment")
    number: number
}