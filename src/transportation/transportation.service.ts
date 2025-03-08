import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { Repository } from 'typeorm';
import { ICreateCar, ICreateLine } from './validator/validator';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { format } from 'date-fns';
import { StockCar } from 'src/entity/stock_car.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { DeliveryDetail } from 'src/entity/delivery_detail.entity';
import { Product } from 'src/entity/product.entity';
import { Money } from 'src/entity/money.entity';


@Injectable()
export class TransportationService {
    constructor(
        @InjectRepository(Transportation_Car)
        private transportationRepository: Repository<Transportation_Car>,

        @InjectRepository(Line)
        private LineRepository: Repository<Line>,

        @InjectRepository(DropOffPoint)
        private dropOffPointRepository: Repository<DropOffPoint>,

        @InjectRepository(StockCar)
        private stockCarRepository: Repository<StockCar>,

        @InjectRepository(Delivery)
        private deliveryRepository: Repository<Delivery>,

        @InjectRepository(DeliveryDetail)
        private deliveryDetailRepository: Repository<DeliveryDetail>,

        @InjectRepository(Product)
        private productRepository: Repository<Product>,

        @InjectRepository(Money)
        private moneyRepository: Repository<Money>
    ) { }

    async createCar(body: ICreateCar) {
        try {

            const checkCar = await this.transportationRepository.findOne({ where: { car_number: body.car_number } });
            if (checkCar) {
                return { success: false, message: 'Car already exist' }
            }
            const checkDriver = await this.transportationRepository.findOne({ where: { user_id: body.user_id } });
            if (checkDriver) {
                return { success: false, message: 'Driver already exist' }
            }
            console.log(checkCar, checkDriver)
            if (!checkCar && !checkDriver) {
                await this.transportationRepository.createQueryBuilder('transportation_car').insert().values({
                    car_number: body.car_number,
                    user_id: body.user_id
                }).execute();
                return { success: true, message: 'Car created successfully' }
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllCar() {
        try {
            const cars = await this.transportationRepository.find({ relations: ["users"] });
            return cars
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCar(id: number) {
        try {
            const car = await this.transportationRepository.findOne({ where: { id: id } });
            return car
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateCar(id: number, body) {
        try {
            const checkCar = await this.transportationRepository.findOne({ where: { car_number: body.car_number } });
            if (checkCar) {
                return { success: false, message: 'Car already exist' }
            }
            const checkDriver = await this.transportationRepository.findOne({ where: { user_id: body.user_id } });
            if (checkDriver) {
                return { success: false, message: 'Driver already exist' }
            }
            if (!checkCar && !checkDriver) {
                await this.transportationRepository.createQueryBuilder('transportation_car').update()
                    .set({ car_number: body.car_number, user_id: body.user_id }).where({ id: id }).execute();
                return { success: true, message: 'Car updated successfully' }
            }

        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteCar(id: number) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').delete().where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async createLine(body: ICreateLine) {
        try {
            const existingLineName = await this.LineRepository.findOne({ where: { line_name: body.line_name, car_id: body.car_id } });
            if (existingLineName) {
                return { success: false, message: 'Line name already exists for this car' };
            } else {
                const TsLine = []
                const dropOff = []
                for (const item of body.customer_id) {

                    TsLine.push({
                        line_name: body.line_name,
                        car_id: body.car_id,
                        customer_id: item
                    })

                }
                const result = await this.LineRepository.createQueryBuilder('Line')
                    .insert()
                    .values(TsLine)
                    .execute();

                return { success: true, message: 'Line created successfully' }
            }

        } catch (error) {
            throw new Error(error.message)
        }
    }
    async getAllLines() {
        try {
            const lines = await this.LineRepository.find({
                relations: ["transportation_car", "customer", "transportation_car.users"]
            });

            const mergedData = lines.reduce((acc, line) => {
                const existingLine = acc.find((l) => l.line_name === line.line_name && l.transportation_car.id === line.transportation_car.id);
                if (existingLine) {
                    if (!existingLine.lineArray.includes(line.id)) {
                        existingLine.lineArray.push(line.id);
                    }
                    if (!existingLine.customer) {
                        existingLine.customer = [];
                    }
                    existingLine.customer.push({ ...line.customer, line_id: line.id });
                } else {
                    acc.push({ ...line, customer: [{ ...line.customer, line_id: line.id }], lineArray: [line.id], });
                }
                return acc;
            }, []);

            return mergedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getLineByCarId(carId: number, date: string) {
        try {

            const drop_off_points = await this.dropOffPointRepository.createQueryBuilder('d')
                .where({ car_id: carId })
                .andWhere(`d.createAt BETWEEN :startDay AND :endDay`, { startDay: `${date} 00:00:00`, endDay: `${date} 23:59:59` })
                .leftJoinAndSelect('d.line', 'line')
                .leftJoinAndSelect('d.customer', 'customer')
                .leftJoinAndSelect('d.customer_order', 'customer_order')
                .leftJoinAndSelect('customer_order.order_customer_details', 'order_customer_detail')
                .leftJoinAndSelect('order_customer_detail.product', 'product')
                .leftJoinAndSelect('d.delivery_details', 'delivery_detail')
                .leftJoinAndSelect('delivery_detail.product', 'product_detail')
                .orderBy('d.createAt', 'DESC')
                .getMany();
            const drop_dayly: any = []
            const drop_order: any = []
            drop_off_points.map((item) => {
                if (item.drop_type === 'dayly') {
                    drop_dayly.push(item)
                } else if (item.drop_type === 'order') {
                    drop_order.push(item)
                }
            })

            return {
                drop_dayly: drop_dayly,
                drop_order: drop_order
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }


    async getLine(id: number) {
        try {
            const line = await this.LineRepository.findOne({ where: { id: id } });
            return line
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateLine(id: number, body: any) {
        try {
            await this.LineRepository.createQueryBuilder('Line')
                .update()
                .where({ id: id })
                .set({
                    line_name: body.line_name,
                    car_id: body.car_id,
                    customer_id: body.customer_id
                })
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteLine(id: number) {
        try {
            await this.LineRepository.createQueryBuilder('Line').delete()
                .where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteLineWithArray(id: number[]) {
        try {
            await this.LineRepository.createQueryBuilder('Line')
                .delete()
                .whereInIds(id).execute()
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async updateDeliveryStatus(id: number, body: { products: [], product_amount: object, car_id: number, status: string }) {
        try {
            if (body.products) {
                const delivery = await this.deliveryRepository.createQueryBuilder('delivery').insert().values({
                    date_time: new Date(),
                    delivery_status: body.status,
                    status: "active",
                    car_id: body.car_id,

                }).execute();
                const deliveryDetailArray = []
                let priceAmount = 0
                for (const stockId of body.products) {
                    const amount = body.product_amount[stockId];
                    if (!amount) {
                        continue; // Skip if no amount is provided for the product
                    }

                    const checkProduct = await this.stockCarRepository.findOne({ where: { id: stockId } });
                    const findProduct = await this.productRepository.findOne({ where: { id: stockId } });
                    if (!checkProduct) return { success: false, message: `Product with id ${stockId} not found` };
                    if (checkProduct.amount < amount) return { success: false, message: `Product amount not enough for product id ${stockId}` };

                    deliveryDetailArray.push({
                        delivery_id: delivery.identifiers[0].id,
                        stock_car_id: stockId,
                        amount: amount,
                        ice_id: checkProduct.product_id,
                        drop_id: id,
                        status: "active",
                        price: findProduct.price

                    })
                    priceAmount += findProduct.price * amount
                    checkProduct.amount -= amount
                    await this.stockCarRepository.save(checkProduct)

                }
                // console.log(priceAmount)
                if (body.status === "success") {
                    await this.moneyRepository.createQueryBuilder('money')
                        .insert()
                        .into(Money)
                        .values({
                            date_time: new Date(),
                            dateString: format(new Date(), 'yyyy-MM-dd'),
                            delevery_id: delivery.identifiers[0].id,
                            status: "active",
                            amount: priceAmount
                        }).execute()
                }

                await this.deliveryDetailRepository.createQueryBuilder('delivery_detail')
                    .insert()
                    .into(DeliveryDetail)
                    .values(deliveryDetailArray)
                    .execute();
            }
            const drop_off_point = await this.dropOffPointRepository.findOne({ where: { id: id } });
            if (!drop_off_point) {
                throw new Error('Delivery not found');
            }

            drop_off_point.drop_status = body.status;
            await this.dropOffPointRepository.save(drop_off_point);
            return {
                success: true, message: "Update Delivery Status Success"
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }







}
