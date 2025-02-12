import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { WithdrawDetail } from "./withdraw_detail.entity";

@Entity({ name: 'stock_in_car' })
export class StockCar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    withdraw_detail_id: number;

    @Column()
    product_id: number;

    @Column()
    amount: number;

    @Column()
    car_id: number

    @OneToOne(() => WithdrawDetail, withdrawDetail => withdrawDetail.stock_car)
    withdraw_detail: WithdrawDetail
}
