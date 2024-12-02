import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Loading } from "./loading.entity";
import { ManufactureDetail } from "./manufacture_detail.entity";
@Entity({ name: "ice" })
export class Product extends FactoryTemplate {

    @Column()
    name: string

    @Column()
    price: number

    // @Column()
    // amount: number

    @ManyToOne(() => Loading, loading => loading.products)

    loading: Loading

    @OneToOne(() => ManufactureDetail, manufactureDetail => manufactureDetail.products)
    manufacture_detail: ManufactureDetail
}
