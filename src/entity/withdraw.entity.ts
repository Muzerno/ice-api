import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { WithdrawDetail } from "./withdraw_detail.entity";
import { Transportation_Car } from "./transport_car.entity";
import { User } from "./user.entity";


@Entity()
export class Withdraw extends FactoryTemplate {
    @Column()
    data_time: Date

    @Column()
    to_day: string

    @Column()
    user_id: number

    @Column()
    car_id: number

    @OneToMany(() => WithdrawDetail, withdrawDetail => withdrawDetail.withdraw)
    withdraw_details: WithdrawDetail[]

    @ManyToOne(() => Transportation_Car, transportation_car => transportation_car.withdraw)
    @JoinColumn({ name: "car_id" })
    transportation_car: Transportation_Car

    @ManyToOne(() => User, user => user.withdraws)
    @JoinColumn({ name: "user_id" })
    user: User
}