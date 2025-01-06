import { Injectable } from '@nestjs/common';
import { Withdraw } from 'src/entity/withdraw.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WithdrawDetail } from 'src/entity/withdraw_detail.entity';
import { IReqCreateWithdraw } from './validator/validator';
import { Product } from 'src/entity/product.entity';
import { format } from 'date-fns';




@Injectable()
export class WithdrawService {
    constructor(
        @InjectRepository(Withdraw)
        private readonly withdrawRepository: Repository<Withdraw>,

        @InjectRepository(WithdrawDetail)
        private readonly withdrawDetailRepository: Repository<WithdrawDetail>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) { }

    async createWithdraw(withdrawData: IReqCreateWithdraw) {

        const checkProduct = await this.productRepository.findOne({ where: { id: withdrawData.product_id } });
        if (!checkProduct) return { success: false, message: 'Product not found' };
        if (checkProduct.amount < withdrawData.amount) return { success: false, message: 'Product amount not enough' };
        const existingWithdraw = await this.withdrawRepository.findOne({ where: { user_id: withdrawData.user_id, car_id: withdrawData.car_id, to_day: format(new Date(), 'yyyy-MM-dd') } });
        let savedWithdraw;
        if (existingWithdraw) {
            if (format(existingWithdraw.data_time, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
                existingWithdraw.status = "active";
                savedWithdraw = await this.withdrawRepository.update(existingWithdraw.id, existingWithdraw);
            } else {
                const withdraw = new Withdraw();
                withdraw.user_id = withdrawData.user_id;
                withdraw.car_id = withdrawData.car_id;
                withdraw.data_time = new Date();
                withdraw.to_day = format(new Date(), 'yyyy-MM-dd');
                savedWithdraw = await this.withdrawRepository.save(withdraw);
            }
        } else {
            const withdraw = new Withdraw();
            withdraw.user_id = withdrawData.user_id;
            withdraw.car_id = withdrawData.car_id;
            withdraw.data_time = new Date();
            withdraw.to_day = format(new Date(), 'yyyy-MM-dd');
            savedWithdraw = await this.withdrawRepository.save(withdraw);
        }
        if (format(existingWithdraw.data_time, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
            const withdrawDetailData = await this.withdrawDetailRepository.findOne({ where: { withdraw_id: savedWithdraw.id ?? existingWithdraw.id, ice_id: withdrawData.product_id } });
            if (withdrawDetailData) {
                withdrawDetailData.amount += withdrawData.amount;
                await this.withdrawDetailRepository.save(withdrawDetailData);
            } else {
                const withdrawDetail = new WithdrawDetail();
                withdrawDetail.amount = withdrawData.amount;
                withdrawDetail.date_time = new Date();
                withdrawDetail.ice_id = withdrawData.product_id;
                withdrawDetail.withdraw_id = savedWithdraw.id ?? existingWithdraw.id;
                await this.withdrawDetailRepository.save(withdrawDetail);
            }
        } else {
            const withdrawDetail = new WithdrawDetail();
            withdrawDetail.amount = withdrawData.amount;
            withdrawDetail.date_time = new Date();
            withdrawDetail.ice_id = withdrawData.product_id;
            withdrawDetail.withdraw_id = savedWithdraw.id ?? existingWithdraw.id;
            await this.withdrawDetailRepository.save(withdrawDetail);
        }
        await this.productRepository.update({ id: withdrawData.product_id }, { amount: checkProduct.amount - withdrawData.amount });

        return { success: true, message: "Withdraw created successfully" };
    }

    async findAllWithdraws(): Promise<Withdraw[]> {
        return this.withdrawRepository.find({ relations: ["user", "transportation_car", "withdraw_details", "withdraw_details.product"], order: { id: "DESC" } });
    }

    async findWithdrawById(id: number): Promise<Withdraw> {
        return this.withdrawRepository.findOne({ where: { id: id } });
    }

    async updateWithdraw(id: number, updateData: Partial<Withdraw>): Promise<Withdraw> {
        await this.withdrawRepository.update(id, updateData);
        return this.withdrawRepository.findOne({ where: { id: id } });
    }

    async deleteWithdraw(id: number): Promise<void> {
        await this.withdrawRepository.delete(id);
    }
}