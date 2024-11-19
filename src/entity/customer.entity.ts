import { Column, Entity, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Transportation_line } from "./transportation.entity";
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

    @OneToMany(() => Transportation_line, transportation_line => transportation_line.customer)
    transportation_lines: Transportation_line[]

}
