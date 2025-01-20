import { Column, Entity, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Line } from "./transportation.entity";
import { DropOffPoint } from "./drop_off_point.entity";
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

    @OneToMany(() => DropOffPoint, dropOffPoint => dropOffPoint.customer)
    drop_off_points: DropOffPoint[]

}
