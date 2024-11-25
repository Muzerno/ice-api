import { Column, Entity, ManyToOne } from "typeorm";
import { FactoryTemplate } from "./factory.template";
import { Withdraw } from "./withdraw.entity";

@Entity({ name: "withdraw_detail" })
export class WithdrawDetail extends FactoryTemplate {

    @Column()
    date_time: Date

    @Column()
    amount: number

    @Column()
    ice_id: number

    @Column()
    withdraw_id: number

    @ManyToOne(() => Withdraw, withdraw => withdraw.withdraw_details)
    withdraw: Withdraw
}