import { Injectable } from '@nestjs/common';
import { Withdraw } from 'src/entity/withdraw.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WithdrawDetail } from 'src/entity/withdraw_detail.entity';
import { IReqCreateWithdraw } from './validator/validator';
import { Product } from 'src/entity/product.entity';

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
        console.log(
            "create"
        )
        const checkProduct = await this.productRepository.findOne({ where: { id: withdrawData.product_id } });
        if (!checkProduct) return { success: false, message: 'Product not found' };
        console.log(checkProduct.amount < withdrawData.amount);
        if (checkProduct.amount < withdrawData.amount) return { success: false, message: 'Product amount not enough' };

        const existingWithdraw = await this.withdrawRepository.findOne({ where: { user_id: withdrawData.user_id, car_id: withdrawData.car_id } });

        let savedWithdraw;
        if (existingWithdraw) {
            existingWithdraw.status = "active";
            savedWithdraw = await this.withdrawRepository.save(existingWithdraw);
        } else {
            const withdraw = new Withdraw();
            withdraw.user_id = withdrawData.user_id;
            withdraw.car_id = withdrawData.car_id;
            withdraw.data_time = new Date();
            savedWithdraw = await this.withdrawRepository.save(withdraw);
        }


        const withdrawDetail = new WithdrawDetail();
        withdrawDetail.amount = withdrawData.amount;
        withdrawDetail.date_time = new Date();
        withdrawDetail.ice_id = withdrawData.product_id;
        withdrawDetail.withdraw_id = savedWithdraw.id;
        await this.withdrawDetailRepository.save(withdrawDetail);
        await this.productRepository.update({ id: withdrawData.product_id }, { amount: checkProduct.amount - withdrawData.amount });

        return { success: true, message: "Withdraw created successfully" };
    }

    async findAllWithdraws(): Promise<Withdraw[]> {
        return this.withdrawRepository.find({ relations: ["user", "transportation_car", "withdraw_details", "withdraw_details.product"] });
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