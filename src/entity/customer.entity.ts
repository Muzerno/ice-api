import { Column, Entity } from "typeorm";
import { FactoryTemplate } from "./factory.template";
@Entity()
export class Customer extends FactoryTemplate {

    @Column()
    name: string

    @Column()
    telephone: string

    @Column()
    latitude: string

    @Column()
    longitude: string

    @Column({ type: "text" })
    address: string

}
