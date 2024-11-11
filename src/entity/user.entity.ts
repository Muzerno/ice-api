import { UUID } from "crypto";
import { FactoryTemplate } from "src/entity/factory.template";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
@Entity()
export class User extends FactoryTemplate {

   @Column()
   username:string

   @Column()
   password:string

   @Column()
   telephone:string

   @Column()
   name:string

   @ManyToOne(() => Role, role => role.users)
   @JoinColumn({name:"role_uuid"})
   role:Role

}
