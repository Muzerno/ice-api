import { UUID } from "crypto";
import { FactoryTemplate } from "src/entity/factory.template";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Transportation_Car } from "./transport_car.entity";
import { Withdraw } from "./withdraw.entity";
@Entity()
export class User extends FactoryTemplate {

   @Column({ length: 50 })
   username: string

   @Column({})
   password: string

   @Column({ length: 10 })
   telephone: string

   @Column()
   address: string

   @Column()
   firstname: string

   @Column()
   lastname: string

   @ManyToOne(() => Role, role => role.users)
   @JoinColumn({ name: "role_id" })
   role: Role

   @OneToOne(() => Transportation_Car, transportation_car => transportation_car.users)
   transportation_car: Transportation_Car

   @OneToMany(() => Withdraw, withdraw => withdraw.user)
   withdraws: Withdraw

}
