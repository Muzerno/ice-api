import { Column, Entity, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Line } from "./transportation.entity";
@Entity()
export class Customer extends FactoryTemplate {

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

    @OneToMany(() => Line, Line => Line.customer)
    Lines: Line[]

}
