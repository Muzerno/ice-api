import { Column, Entity } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { UUID } from "crypto";

@Entity()
export class Transportation_Car extends FactoryTemplate {

    @Column()
    car_number:string

    @Column()
    key_api:string

    @Column()
    user_uid:UUID
}