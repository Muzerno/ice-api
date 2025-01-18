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
        try {
            const today = new Date();
            const formattedToday = format(today, 'yyyy-MM-dd');

            let savedWithdraw = await this.withdrawRepository.findOne({
                where: {
                    user_id: withdrawData.user_id,
                    car_id: withdrawData.car_id,
                    to_day: formattedToday
                }
            });

            if (!savedWithdraw) {
                const withdraw = new Withdraw();
                withdraw.user_id = withdrawData.user_id;
                withdraw.car_id = withdrawData.car_id;
                withdraw.date_time = today;
                withdraw.to_day = formattedToday;
                savedWithdraw = await this.withdrawRepository.save(withdraw);

                if (!savedWithdraw) {
                    throw new Error('Failed to save withdraw');
                }
            }

            for (const productId of withdrawData.product_id) {
                const amount = withdrawData.amount[productId];
                if (!amount) {
                    continue; // Skip if no amount is provided for the product
                }

                const checkProduct = await this.productRepository.findOne({ where: { id: productId } });
                if (!checkProduct) return { success: false, message: `Product with id ${productId} not found` };
                if (checkProduct.amount < amount) return { success: false, message: `Product amount not enough for product id ${productId}` };
                const existingWithdrawDetail = await this.withdrawDetailRepository.findOne({
                    where: {
                        ice_id: productId,
                        withdraw_id: savedWithdraw.id,
                    }
                });
                if (existingWithdrawDetail) {
                    if (format(existingWithdrawDetail.date_time, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
                        // Update existing record
                        existingWithdrawDetail.amount += amount;
                        await this.withdrawDetailRepository.save(existingWithdrawDetail);
                    } else {
                        // Insert new record
                        const withdrawDetail = new WithdrawDetail();
                        withdrawDetail.amount = amount;
                        withdrawDetail.ice_id = productId;
                        withdrawDetail.withdraw_id = savedWithdraw.id;
                        withdrawDetail.date_time = today;
                        await this.withdrawDetailRepository.save(withdrawDetail);
                    }
                } else {
                    // Insert new record
                    const withdrawDetail = new WithdrawDetail();
                    withdrawDetail.amount = amount;
                    withdrawDetail.ice_id = productId;
                    withdrawDetail.withdraw_id = savedWithdraw.id;
                    withdrawDetail.date_time = today;
                    await this.withdrawDetailRepository.save(withdrawDetail);
                }
                // if (format(existingWithdrawDetail.date_time, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
                //     // Update existing record
                //     existingWithdrawDetail.amount += amount;
                //     await this.withdrawDetailRepository.save(existingWithdrawDetail);
                // } else {
                //     // Insert new record
                //     const withdrawDetail = new WithdrawDetail();
                //     withdrawDetail.amount = amount;
                //     withdrawDetail.ice_id = productId;
                //     withdrawDetail.withdraw_id = savedWithdraw.id;
                //     withdrawDetail.date_time = today;
                //     await this.withdrawDetailRepository.save(withdrawDetail);
                // }

                checkProduct.amount -= amount;
                await this.productRepository.save(checkProduct);
            }

            return { success: true, message: "Withdraw created successfully" };
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
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