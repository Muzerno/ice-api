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
  ) {}

  private generateCustomerCode(): string {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let code = 'CV-';
    for (let i = 0; i < 2; i++)
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 0; i < 5; i++)
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++)
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));

    return code;
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
          where: { id: productId },
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
              withdraw_id: savedWithdraw.id,
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
            withdrawDetail.withdraw_id = savedWithdraw.id;
            await this.withdrawDetailRepository.save(withdrawDetail);
          }
        } else {
          const withdrawDetail = new WithdrawDetail();
          withdrawDetail.amount = amount;
          withdrawDetail.ice_id = productId;
          withdrawDetail.withdraw_id = savedWithdraw.id;
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

      // Find Line by car_id
      const line = await this.LineRepository.find({
        where: { car_id: withdrawData.car_id },
        relations: ['customer'],
      });

      if (!line || line.length === 0) {
        return {
          success: false,
          message: `Line with car_id ${withdrawData.car_id} not found`,
        };
      }

      // สร้าง DropOffPoint ถ้ายังไม่มีวันนี้
      for (const lineItem of line) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const existingDropOffPoint = await this.dropOffPointRepository.findOne({
          where: {
            customer_id: lineItem.customer_id,
            car_id: withdrawData.car_id,
            drop_type: 'dayly',
            createAt: Between(startOfToday, endOfToday),
          },
        });

        if (!existingDropOffPoint) {
          const dropOffPoint = new DropOffPoint();
          dropOffPoint.line_id = lineItem.id;
          dropOffPoint.customer_id = lineItem.customer_id;
          dropOffPoint.latitude = lineItem.customer.latitude;
          dropOffPoint.longitude = lineItem.customer.longitude;
          dropOffPoint.car_id = withdrawData.car_id;
          dropOffPoint.drop_status = 'inprogress';
          dropOffPoint.drop_type = 'dayly';
          dropOffPoint.createAt = new Date();
          await this.dropOffPointRepository.save(dropOffPoint);
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
      .leftJoinAndSelect('transportation_car.Lines', 'line') // ✅ join จากรถไปยังสายรถ
      .where('DATE(withdraw.date_time) = :date', { date })
      .orderBy('withdraw.id', 'DESC')
      .getMany();

    return res;
  }

  async findAllOrdeVip(): Promise<Customer[]> {
    return this.customerRepository.find({
      where: {
        type_cus: 1, // เงื่อนไขดึงเฉพาะ type_cus = 1
      },
      relations: [
        'drop_off_points',
        'drop_off_points.car', // ถ้าต้องการข้อมูลรถด้วย
      ],
      order: { id: 'DESC' },
    });
  }

  async findWithdrawById(id: number): Promise<Withdraw> {
    return this.withdrawRepository.findOne({ where: { id: id } });
  }

  async updateWithdraw(
    id: number,
    updateData: Partial<Withdraw>,
  ): Promise<Withdraw> {
    await this.withdrawRepository.update(id, updateData);
    return this.withdrawRepository.findOne({ where: { id: id } });
  }

  async deleteWithdraw(id: number): Promise<void> {
    await this.withdrawRepository.delete(id);
  }

  async createOrderVip(body: ICreateOrderVip) {
    try {
      // Generate customer code
      const customerCode = this.generateCustomerCode();

      const customer = new Customer();
      customer.name = body.customer_name;
      customer.telephone = body.telephone;
      customer.latitude = body.latitude;
      customer.longitude = body.longitude;
      customer.address = body.address;
      customer.customer_code = customerCode;
      customer.type_cus = 1;

      const savedCustomer = await this.customerRepository.save(customer);

      if (!savedCustomer) {
        throw new Error('Failed to save customer');
      }

      // สร้าง DropOffPoint เชื่อมกับ Customer (ยังส่ง car_id ไปที่ DropOffPoint ตามปกติ)
      const dropOffPoint = new DropOffPoint();
      dropOffPoint.drop_status = 'inprogress';
      dropOffPoint.latitude = body.latitude;
      dropOffPoint.longitude = body.longitude;
      dropOffPoint.drop_type = 'order';
      dropOffPoint.car_id = body.car_id; // ยังคงส่ง car_id มาที่ DropOffPoint
      dropOffPoint.customer_id = savedCustomer.id;
      await this.dropOffPointRepository.save(dropOffPoint);

      return {
        success: true,
        message: 'Order VIP created successfully',
        customer_code: customerCode,
      };
    } catch (error) {
      console.error('Error in createOrderVip:', error);
      throw new Error(
        error.message || 'An error occurred during order VIP creation',
      );
    }
  }

  async removeOrderVip(id: number) {
    try {
      const orderVip = await this.orderCustomerRepository.findOne({
        where: { id },
      });
      if (!orderVip) {
        return { success: false, message: 'Order VIP not found' };
      }

      await this.orderCustomerRepository.delete(id);
      return { success: true, message: 'Order VIP deleted successfully' };
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}
