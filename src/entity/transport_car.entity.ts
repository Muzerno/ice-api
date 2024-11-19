import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";
import { User } from "./user.entity";
import { Transportation_line } from "./transportation.entity";

@Entity()
export class Transportation_Car extends FactoryTemplate {

    @Column()
    car_number: string

    @Column({ nullable: true })
    key_api: string

    @Column()
    user_uid: UUID

    @OneToOne(() => User, user => user.transportation_car)
    @JoinColumn({ name: "user_uid" })
    users: User

    @OneToMany(type => Transportation_line, transportation_line => transportation_line.transportation_car)
    transportation_lines: Transportation_line[]
}