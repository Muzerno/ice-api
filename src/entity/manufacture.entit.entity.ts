import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { ManufactureDetail } from "./manufacture_detail.entity";
import { User } from "./user.entity";

@Entity()
export class Manufacture extends FactoryTemplate {
    @Column()
    date_time: Date

    @Column()
    user_id: number

    @OneToMany(() => ManufactureDetail, manufactureDetail => manufactureDetail.manufacture, { onDelete: "CASCADE" })
    manufacture_details: ManufactureDetail[]

    @ManyToOne(() => User, user => user.manufactures)
    @JoinColumn({ name: "user_id" })
    user: User

}