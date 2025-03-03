import { Injectable } from '@nestjs/common';
import { Withdraw } from 'src/entity/withdraw.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WithdrawDetail } from 'src/entity/withdraw_detail.entity';
import { ICreateOrderVip, IReqCreateWithdraw } from './validator/validator';
import { Product } from 'src/entity/product.entity';
import { format } from 'date-fns';
import { OrderCustomer } from 'src/entity/order_customer.entity';
import { OrderCustomerDetail } from 'src/entity/order_customer_detail.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { StockCar } from 'src/entity/stock_car.entity';




@Injectable()
export class WithdrawService {
    constructor(
        @InjectRepository(Withdraw)
        private readonly withdrawRepository: Repository<Withdraw>,

        @InjectRepository(WithdrawDetail)
        private readonly withdrawDetailRepository: Repository<WithdrawDetail>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(OrderCustomer)
        private readonly orderCustomerRepository: Repository<OrderCustomer>,

        @InjectRepository(OrderCustomerDetail)
        private readonly orderCustomerDetailRepository: Repository<OrderCustomerDetail>,

        @InjectRepository(DropOffPoint)
        private readonly dropOffPointRepository: Repository<DropOffPoint>,

        @InjectRepository(Line)
        private readonly LineRepository: Repository<Line>,

        @InjectRepository(StockCar)
        private readonly stockCarRepository: Repository<StockCar>
    ) { }

    async createWithdraw(withdrawData: IReqCreateWithdraw) {
        try {
            const today = new Date();
            const formattedToday = format(today, 'yyyy-MM-dd');

            let savedWithdraw = await this.withdrawRepository.findOne({
                where: {
                    user_id: withdrawData.user_id,
                    car_id: withdrawData.car_id,
                    line_id: withdrawData.line_id,
                    to_day: formattedToday
                }
            });

            if (!savedWithdraw) {
                const withdraw = new Withdraw();
                withdraw.user_id = withdrawData.user_id;
                withdraw.car_id = withdrawData.car_id;
                withdraw.line_id = withdrawData.line_id;
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
                const findStockCar = await this.stockCarRepository.findOne({ where: { product_id: productId, car_id: withdrawData.car_id } });
                if (findStockCar) {
                    findStockCar.amount += amount;
                    await this.stockCarRepository.save(findStockCar);
                } else {
                    const stockCar = new StockCar();
                    stockCar.product_id = productId;
                    stockCar.amount = amount;
                    stockCar.car_id = withdrawData.car_id;
                    await this.stockCarRepository.save(stockCar);
                }

                checkProduct.amount -= amount;
                await this.productRepository.save(checkProduct);
            }
            // Find Line by car_id
            const line = await this.LineRepository.find({ where: { car_id: withdrawData.car_id }, relations: ["customer"] });
            if (!line) {
                return { success: false, message: `Line with car_id ${withdrawData.car_id} not found` };
            }
            // Loop through customer_id to create DropOffPoint entries
            for (const lineItem of line) {
                const dropOffPoint = new DropOffPoint();
                dropOffPoint.line_id = lineItem.id;
                dropOffPoint.customer_id = lineItem.customer_id;
                dropOffPoint.latitude = lineItem.customer.latitude;
                dropOffPoint.longitude = lineItem.customer.longitude;
                dropOffPoint.car_id = withdrawData.car_id;
                dropOffPoint.status = "active";
                dropOffPoint.drop_status = "inprogress";
                dropOffPoint.drop_type = "dayly";
                dropOffPoint.createAt = new Date();
                await this.dropOffPointRepository.save(dropOffPoint);
            }
            return { success: true, message: "Withdraw created successfully" };
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
    async findAllWithdraws(date: string): Promise<Withdraw[]> {
        console.log(date)
        const res = await this.withdrawRepository.find({
            relations: ["user", "withdraw_details", "withdraw_details.product", "line"],
            where: { to_day: date }, order: { id: "DESC" }
        });
        return res;
    }

    async findAllOrdeVip(): Promise<OrderCustomer[]> {
        return this.orderCustomerRepository.find({ relations: ["order_customer_details", "order_customer_details.product", "transportation_car"], order: { id: "DESC" } });
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


    async createOrderVip(body: ICreateOrderVip) {
        try {
            const orderVip = new OrderCustomer();
            orderVip.car_id = body.car_id;
            orderVip.name = body.customer_name;
            orderVip.telephone = body.telephone;
            orderVip.latitude = body.latitude;
            orderVip.longitude = body.longitude;
            orderVip.address = body.address;
            orderVip.customer_code = body.customer_code;
            const savedOrderVip = await this.orderCustomerRepository.save(orderVip);

            if (!savedOrderVip) {
                throw new Error('Failed to save orderVip');
            }
            for (const productId of body.product_id) {
                const amount = body.amount[productId];
                if (!amount) {
                    continue; // Skip if no amount is provided for the product
                }
                const checkProduct = await this.productRepository.findOne({ where: { id: productId } });
                if (!checkProduct) return { success: false, message: `Product with id ${productId} not found` };
                if (checkProduct.amount < amount) return { success: false, message: `Product amount not enough for product id ${productId}` };
                const orderVipDetail = new OrderCustomerDetail();
                orderVipDetail.amount = amount;
                orderVipDetail.product_id = productId;
                orderVipDetail.order_customer_id = savedOrderVip.id;
                await this.orderCustomerDetailRepository.save(orderVipDetail);

                const product = await this.productRepository.findOne({ where: { id: productId } });
                if (product) {
                    product.amount -= amount;
                    await this.productRepository.save(product);
                }
            }
            const dropOffPoint = new DropOffPoint();
            dropOffPoint.status = "active"; // Default status, adjust as needed
            dropOffPoint.drop_status = "inprogress";
            dropOffPoint.latitude = body.latitude;
            dropOffPoint.longitude = body.longitude;
            dropOffPoint.drop_type = "order";
            dropOffPoint.car_id = body.car_id;
            dropOffPoint.customer_order_id = savedOrderVip.id;
            await this.dropOffPointRepository.save(dropOffPoint);

            return { success: true, message: "Order VIP created successfully" };
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async removeOrderVip(id: number) {
        try {
            const orderVip = await this.orderCustomerRepository.findOne({ where: { id } });
            if (!orderVip) {
                return { success: false, message: "Order VIP not found" };
            }

            await this.orderCustomerRepository.delete(id);
            return { success: true, message: "Order VIP deleted successfully" };
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

}