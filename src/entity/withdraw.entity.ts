import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { WithdrawDetail } from "./withdraw_detail.entity";
import { Transportation_Car } from "./transport_car.entity";


@Entity()
export class Withdraw extends FactoryTemplate {
    @Column()
    data_time: Date

    @Column()
    user_id: number

    @Column()
    car_id: number

    @OneToMany(() => WithdrawDetail, withdrawDetail => withdrawDetail.withdraw)
    withdraw_details: WithdrawDetail[]

    @OneToOne(() => Transportation_Car, transportation_car => transportation_car.withdraw)
    @JoinColumn({ name: "car_id" })
    transportation_car: Transportation_Car
}