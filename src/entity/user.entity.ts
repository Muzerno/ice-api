import { UUID } from "crypto";
import { FactoryTemplate } from "src/entity/factory.template";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Transportation_Car } from "./transport_car.entity";
@Entity()
export class User extends FactoryTemplate {

   @Column()
   username: string

   @Column()
   password: string

   @Column()
   telephone: string

   @Column()
   name: string

   @ManyToOne(() => Role, role => role.users)
   @JoinColumn({ name: "role_uuid" })
   role: Role

   @OneToOne(() => Transportation_Car, transportation_car => transportation_car.users)
   transportation_car: Transportation_Car

}
