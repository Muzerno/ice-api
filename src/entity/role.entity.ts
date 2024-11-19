import { Column, Entity, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { User } from "./user.entity";

@Entity()
export class Role extends FactoryTemplate {

    @Column()
    role_name: string

    @Column()
    role_key: string

    @OneToMany(type => User, user => user.role)
    users: User[]
}