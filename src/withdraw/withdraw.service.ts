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
import { Customer } from 'src/entity/customer.entity';
import { Line } from 'src/entity/transportation.entity';
import { StockCar } from 'src/entity/stock_car.entity';
import { Like } from 'typeorm';
import { Between } from 'typeorm';

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

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(OrderCustomerDetail)
    private readonly orderCustomerDetailRepository: Repository<OrderCustomerDetail>,

    @InjectRepository(DropOffPoint)
    private readonly dropOffPointRepository: Repository<DropOffPoint>,

    @InjectRepository(Line)
    private readonly LineRepository: Repository<Line>,

    @InjectRepository(StockCar)
    private readonly stockCarRepository: Repository<StockCar>,

    @InjectRepository(Transportation_Car)
    private readonly transportationRepository: Repository<Transportation_Car>,
  ) { }

  private generateCustomerCode(): number {
    const min = 100000000;
    const max = 999999999;
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  async createWithdraw(withdrawData: IReqCreateWithdraw) {
    try {
      const today = new Date();
      const formattedToday = format(today, 'yyyy-MM-dd');

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      let savedWithdraw = await this.withdrawRepository.findOne({
        where: {
          user_id: withdrawData.user_id,
          car_id: withdrawData.car_id,
          date_time: Between(startOfToday, endOfToday),
        },
      });

      if (!savedWithdraw) {
        const withdraw = new Withdraw();
        withdraw.user_id = withdrawData.user_id;
        withdraw.car_id = withdrawData.car_id;
        withdraw.date_time = today;
        savedWithdraw = await this.withdrawRepository.save(withdraw);

        if (!savedWithdraw) {
          throw new Error('Failed to save withdraw');
        }
      }

      for (const productId of withdrawData.product_id) {
        const amount = withdrawData.amount[productId];
        if (!amount) continue;

        const checkProduct = await this.productRepository.findOne({
          where: { ice_id: productId.toString() },
        });
        if (!checkProduct)
          return {
            success: false,
            message: `Product with id ${productId} not found`,
          };
        if (checkProduct.amount < amount)
          return {
            success: false,
            message: `Product amount not enough for product id ${productId}`,
          };

        const existingWithdrawDetail =
          await this.withdrawDetailRepository.findOne({
            where: {
              ice_id: productId,
              withdraw_id: savedWithdraw.withdraw_id,
            },
          });

        if (existingWithdrawDetail) {
          // สมมุติว่า withdraw.date_time มีอยู่แล้ว
          const withdrawDate = format(savedWithdraw.date_time, 'yyyy-MM-dd');
          if (withdrawDate === formattedToday) {
            existingWithdrawDetail.amount += amount;
            await this.withdrawDetailRepository.save(existingWithdrawDetail);
          } else {
            // Insert new
            const withdrawDetail = new WithdrawDetail();
            withdrawDetail.amount = amount;
            withdrawDetail.ice_id = productId;
            withdrawDetail.withdraw_id = savedWithdraw.withdraw_id;
            await this.withdrawDetailRepository.save(withdrawDetail);
          }
        } else {
          const withdrawDetail = new WithdrawDetail();
          withdrawDetail.amount = amount;
          withdrawDetail.ice_id = productId;
          withdrawDetail.withdraw_id = savedWithdraw.withdraw_id;
          // withdrawDetail.date_time = today;
          await this.withdrawDetailRepository.save(withdrawDetail);
        }

        const findStockCar = await this.stockCarRepository.findOne({
          where: { ice_id: productId, car_id: withdrawData.car_id },
        });

        if (findStockCar) {
          findStockCar.amount += amount;
          await this.stockCarRepository.save(findStockCar);
        } else {
          const stockCar = new StockCar();
          stockCar.ice_id = productId;
          stockCar.amount = amount;
          stockCar.car_id = withdrawData.car_id;
          await this.stockCarRepository.save(stockCar);
        }

        checkProduct.amount -= amount;
        await this.productRepository.save(checkProduct);
      }

      // โหลด Line พร้อม normalPoints
      const line = await this.LineRepository.find({
        where: { car_id: withdrawData.car_id },
        relations: ['normalPoints', 'normalPoints.customer'],
      });

      if (!line || line.length === 0) {
        return {
          success: false,
          message: `Line with car_id ${withdrawData.car_id} not found`,
        };
      }

      // วนแต่ละ lineItem แล้วไปวน normalPoints ภายใน
      for (const lineItem of line) {
        for (const normalPoint of lineItem.normalPoints) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          const cusId = normalPoint.cus_id;
          const customer = normalPoint.customer;

          if (!cusId || !customer) continue;

          const existingDropOffPoint =
            await this.dropOffPointRepository.findOne({
              where: {
                customer_id: String(cusId),
                car_id: withdrawData.car_id,
                drop_type: 'dayly',
                date_drop: Between(startOfToday, endOfToday),
              },
            });

          if (!existingDropOffPoint) {
            const dropOffPoint = new DropOffPoint();
            dropOffPoint.line_id = lineItem.line_id;
            dropOffPoint.customer_id = String(cusId);
            dropOffPoint.latitude = customer.latitude;
            dropOffPoint.longitude = customer.longitude;
            dropOffPoint.car_id = withdrawData.car_id;
            dropOffPoint.drop_status = 'inprogress';
            dropOffPoint.drop_type = 'dayly';
            dropOffPoint.date_drop = new Date();
            await this.dropOffPointRepository.save(dropOffPoint);
          }
        }
      }

      return { success: true, message: 'Withdraw created successfully' };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async findAllWithdraws(date: string): Promise<Withdraw[]> {
    console.log(date);
    const res = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .leftJoinAndSelect('withdraw.user', 'user')
      .leftJoinAndSelect('withdraw.withdraw_details', 'withdraw_details')
      .leftJoinAndSelect('withdraw_details.product', 'product')
      .leftJoinAndSelect('withdraw.transportation_car', 'transportation_car')
      .leftJoinAndSelect('transportation_car.Lines', 'line')
      .leftJoinAndSelect('transportation_car.users', 'driver')
      .where('DATE(withdraw.date_time) = :date', { date })
      .orderBy('withdraw.withdraw_id', 'DESC')
      .getMany();

    return res;
  }

  async findAllOrdeVip(): Promise<Customer[]> {
    return this.customerRepository.find({
      relations: [
        'drop_off_points',
        'drop_off_points.car',
        'drop_off_points.line',
      ],
      order: {
        type_cus: 'DESC',
        customer_id: 'DESC',
      },
    });
  }

  async findOrderVipByCarId(car_id: number): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.drop_off_points', 'drop_off_points')
      .leftJoinAndSelect('drop_off_points.car', 'car')
      .leftJoinAndSelect('drop_off_points.line', 'line')
      .where('car.car_id = :car_id', { car_id })
      .orderBy('customer.type_cus', 'DESC')
      .addOrderBy('customer.customer_id', 'DESC')
      .getMany();
  }


  async findWithdrawById(withdraw_id: number): Promise<Withdraw> {
    return this.withdrawRepository.findOne({
      where: { withdraw_id: withdraw_id },
    });
  }

  async updateWithdraw(
    withdraw_id: number,
    updateData: Partial<Withdraw>,
  ): Promise<Withdraw> {
    await this.withdrawRepository.update(withdraw_id, updateData);
    return this.withdrawRepository.findOne({
      where: { withdraw_id: withdraw_id },
    });
  }

  async deleteWithdraw(id: number): Promise<void> {
    await this.withdrawRepository.delete(id);
  }

  async generateNewCustomerId(): Promise<{ success: boolean; newCustomerId?: string; newCustomerName?: string; error?: string }> {
    try {
      return { success: true, newCustomerId: 'CV-25-001', newCustomerName: 'ลูกค้าพิเศษ' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }


  async createOrderVip(body: ICreateOrderVip) {
    try {
      const fixedCustomerId = 'CV-25-001';

      // ตรวจสอบว่ามีลูกค้ารหัสนี้แล้วหรือยัง
      let existingCustomer = await this.customerRepository.findOne({
        where: { customer_id: fixedCustomerId },
      });

      // ถ้าไม่มี ให้สร้างใหม่
      if (!existingCustomer) {
        const customer = new Customer();
        customer.customer_id = fixedCustomerId;
        // customer.name = body.customer_name;
        // customer.telephone = body.telephone;
        customer.latitude = body.latitude;
        customer.longitude = body.longitude;
        // customer.address = body.address;
        customer.type_cus = 1;

        existingCustomer = await this.customerRepository.save(customer);

        if (!existingCustomer) {
          throw new Error('ไม่สามารถสร้างลูกค้าใหม่ได้');
        }
      }

      // สร้าง DropOffPoint โดยใช้ customer_id ที่ fix
      const dropOffPoint = new DropOffPoint();
      dropOffPoint.drop_status = 'inprogress';
      dropOffPoint.latitude = body.latitude;
      dropOffPoint.longitude = body.longitude;
      dropOffPoint.drop_type = 'order';
      dropOffPoint.note = body.note;
      dropOffPoint.line_id = body.line_id;
      dropOffPoint.car_id = body.car_id;
      dropOffPoint.customer_id = existingCustomer.customer_id;

      await this.dropOffPointRepository.save(dropOffPoint);

      return {
        success: true,
        message: 'Order VIP created successfully',
        customer_code: existingCustomer.customer_id,
      };
    } catch (error) {
      console.error('Error in createOrderVip:', error);
      throw new Error(
        error.message || 'An error occurred during order VIP creation',
      );
    }
  }

  async removeOrderVip(customer_id: string) {
    await this.dropOffPointRepository.delete({ customer_id });

    await this.customerRepository.delete(customer_id);
  }
}
