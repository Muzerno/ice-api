import { Column, Entity, OneToMany } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { ManufactureDetail } from "./manufacture_detail.entity";

@Entity()
export class Manufacture extends FactoryTemplate {
    @Column()
    amount: number

    @Column()
    date_time: Date

    @Column()
    user_id: number

    @OneToMany(() => ManufactureDetail, manufactureDetail => manufactureDetail.manufacture)
    manufacture_details: ManufactureDetail[]
}