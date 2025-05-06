import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { Repository } from 'typeorm';
import { Not } from 'typeorm';
import { ICreateCar, ICreateLine } from './validator/validator';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { format } from 'date-fns';
import { StockCar } from 'src/entity/stock_car.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { DeliveryDetail } from 'src/entity/delivery_detail.entity';
import { Product } from 'src/entity/product.entity';
import { Money } from 'src/entity/money.entity';
import { NormalPoint } from 'src/entity/normal_point.entity';
import { DataSource } from 'typeorm';

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
    private moneyRepository: Repository<Money>,

    @InjectRepository(NormalPoint)
    private normalPointRepository: Repository<NormalPoint>,

    private readonly dataSource: DataSource,
  ) {}

  async createCar(body: ICreateCar) {
    try {
      const checkCar = await this.transportationRepository.findOne({
        where: { car_number: body.car_number },
      });
      if (checkCar) {
        return { success: false, message: 'Car already exist' };
      }
      const checkDriver = await this.transportationRepository.findOne({
        where: { user_id: body.user_id },
      });
      if (checkDriver) {
        return { success: false, message: 'Driver already exist' };
      }
      console.log(checkCar, checkDriver);
      if (!checkCar && !checkDriver) {
        await this.transportationRepository
          .createQueryBuilder('transportation_car')
          .insert()
          .values({
            car_number: body.car_number,
            user_id: body.user_id,
          })
          .execute();
        return { success: true, message: 'Car created successfully' };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllCar() {
    try {
      const cars = await this.transportationRepository.find({
        relations: ['users'],
      });
      return cars;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getCar(car_id: number) {
    try {
      const car = await this.transportationRepository.findOne({
        where: { car_id: car_id },
      });
      return car;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateCar(car_id: number, body) {
    try {
      const checkCar = await this.transportationRepository.findOne({
        where: {
          car_number: body.car_number,
          car_id: Not(car_id), // ยกเว้นตัวเอง
        },
      });

      if (checkCar) {
        return { success: false, message: 'Car number already exists' };
      }

      const checkDriver = await this.transportationRepository.findOne({
        where: {
          user_id: body.user_id,
          car_id: Not(car_id), // ยกเว้นตัวเอง
        },
      });

      if (checkDriver) {
        return {
          success: false,
          message: 'Driver already assigned to another car',
        };
      }

      await this.transportationRepository
        .createQueryBuilder('transportation_car')
        .update()
        .set({ car_number: body.car_number, user_id: body.user_id })
        .where({ car_id: car_id })
        .execute();

      return { success: true, message: 'Car updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteCar(car_id: number) {
    try {
      await this.transportationRepository
        .createQueryBuilder('transportation_car')
        .delete()
        .where({ car_id: car_id })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createLine(body: ICreateLine) {
    try {
      const existingLine = await this.LineRepository.findOne({
        where: { line_name: body.line_name },
      });

      if (existingLine) {
        return {
          success: false,
          message: 'ไม่สามารถใช้ชื่อสายรถนี้ได้ เพราะมีอยู่แล้ว',
        };
      }

      // 1. สร้าง line ใหม่
      const newLine = this.LineRepository.create({
        line_name: body.line_name,
        car_id: body.car_id,
      });

      const savedLine = await this.LineRepository.save(newLine);

      // 2. เอา line_id ไปใส่ normal_point พร้อมกับ customer_id
      const normalPoints = body.customer_id.map((cusId) => ({
        line: { line_id: savedLine.line_id }, // หรือ line: savedLine ก็ได้ถ้าเป็น entity
        customer: { customer_id: cusId },
      }));

      await this.normalPointRepository
        .createQueryBuilder()
        .insert()
        .values(normalPoints)
        .execute();

      return {
        success: true,
        message: 'Line and normal points created successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllLines() {
    try {
      const lines = await this.LineRepository.find({
        relations: [
          'transportation_car',
          'transportation_car.users',
          'normalPoints',
          'normalPoints.customer',
        ],
      });

      const lineMap = new Map();

      for (const line of lines) {
        const key = line.line_id;

        if (!lineMap.has(key)) {
          lineMap.set(key, {
            ...line,
            customer: line.normalPoints.map((np) => ({
              ...np.customer,
              line_id: line.line_id,
            })),
            lineArray: [line.car_id],
          });
        } else {
          const existing = lineMap.get(key);

          if (!existing.lineArray.includes(line.car_id)) {
            existing.lineArray.push(line.car_id);
          }

          for (const np of line.normalPoints) {
            existing.customer.push({
              ...np.customer,
              line_id: line.line_id,
            });
          }
        }
      }

      return Array.from(lineMap.values()).sort((a, b) => {
        const carA = `${a.transportation_car?.car_number ?? ''}`.toUpperCase();
        const carB = `${b.transportation_car?.car_number ?? ''}`.toUpperCase();
        return carA.localeCompare(carB);
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLineByCarId(carId: number, date: string) {
    try {
      const dropOffPoints = await this.dropOffPointRepository
        .createQueryBuilder('d')
        .where({ car_id: carId })
        .andWhere(`d.date_drop BETWEEN :startDay AND :endDay`, {
          startDay: `${date} 00:00:00`,
          endDay: `${date} 23:59:59`,
        })
        // .leftJoinAndSelect('d.line', 'line') // ต้องมี relation นี้ใน Entity
        .leftJoinAndSelect('d.customer', 'customer')
        .leftJoinAndSelect('d.delivery_details', 'delivery_detail')
        .leftJoinAndSelect('delivery_detail.product', 'product_detail')
        .orderBy('d.date_drop', 'DESC')
        .getMany();

      const dropDaily = [];
      const dropOrder = [];

      dropOffPoints.forEach((item) => {
        if (item.drop_type === 'dayly') {
          dropDaily.push(item);
        } else if (item.drop_type === 'order') {
          dropOrder.push(item);
        }
      });

      return {
        drop_dayly: dropDaily, // แก้ไขการสะกดให้สอดคล้องกัน
        drop_order: dropOrder,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // service.ts
  async addCustomersToLine(body: { line_id: number; customer_ids: number[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newNormalPoints = body.customer_ids.map((cus_id: number) => ({
        line_id: body.line_id,
        cus_id,
      }));

      await queryRunner.manager.insert(NormalPoint, newNormalPoints);

      await queryRunner.commitTransaction();
      return { success: true, message: 'เพิ่มลูกค้าในสายเรียบร้อย' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: error.message };
    } finally {
      await queryRunner.release();
    }
  }

  async getLine(line_id: number) {
    try {
      const line = await this.LineRepository.findOne({
        where: { line_id: line_id },
      });
      return line;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateLine(id: number, body: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. อัปเดตข้อมูล Line (ถ้ามีการเปลี่ยนแปลง)
      await queryRunner.manager.update(
        Line,
        { line_id: id },
        {
          line_name: body.line_name,
          car_id: body.car_id,
        },
      );

      // 2. ดึง customer_id ที่มีอยู่แล้วใน normal_point
      const existingNormalPoints = await queryRunner.manager.find(NormalPoint, {
        where: { line_id: id },
      });
      const existingCustomerIds = existingNormalPoints.map((np) => np.cus_id);

      // 3. หาเฉพาะ customer_id ที่ยังไม่มีใน normal_point
      const newCustomerIds = body.customer_ids.filter(
        (cus_id: number) => !existingCustomerIds.includes(cus_id),
      );

      if (newCustomerIds.length > 0) {
        const newNormalPoints = newCustomerIds.map((cus_id: number) => ({
          line_id: id,
          cus_id,
        }));
        await queryRunner.manager.insert(NormalPoint, newNormalPoints);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'อัปเดตสายเดินรถสำเร็จ' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: error.message };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteLine(id: number) {
    try {
      await this.LineRepository.createQueryBuilder('Line')
        .delete()
        .where({ id: id })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeCustomerFromLine(lineId: number, cusId: number) {
    try {
      await this.normalPointRepository
        .createQueryBuilder()
        .delete()
        .where('line_id = :lineId', { lineId })
        .andWhere('cus_id  = :cusId', { cusId })
        .execute();
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteLineWithArray(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ ลบข้อมูลจาก normal_point ที่มี line_id เหล่านี้
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('normal_point')
        .where('line_id IN (:...ids)', { ids })
        .execute();

      // ✅ ลบข้อมูลจาก line
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('line')
        .whereInIds(ids)
        .execute();

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateDeliveryStatus(
    drop_id: number,
    body: {
      products: number[];
      product_amount: Record<number, number>;
      car_id: number;
      delivery_status: string;
    },
  ) {
    try {
      let priceAmount = 0;
      const deliveryDetailArray = [];

      if (body.products && body.products.length > 0) {
        for (const stockId of body.products) {
          const amount = body.product_amount[stockId];
          if (!amount) continue;

          const checkProduct = await this.stockCarRepository.findOne({
            where: { ice_id: stockId },
          });

          if (!checkProduct) {
            return {
              success: false,
              message: `Product with id ${stockId} not found`,
            };
          }

          if (checkProduct.amount < amount) {
            return {
              success: false,
              message: `Product amount not enough for product id ${stockId}`,
            };
          }

          const findProduct = await this.productRepository.findOne({
            where: { id: checkProduct.ice_id },
          });

          if (!findProduct) {
            return {
              success: false,
              message: `Product with ice_id ${checkProduct.ice_id} not found`,
            };
          }

          deliveryDetailArray.push({
            drop_id: drop_id,
            stock_car_id: stockId,
            amount: amount,
            ice_id: checkProduct.ice_id,
            price: findProduct.price,
            delivery_date: new Date(),
            car_id: body.car_id,
          });

          priceAmount += findProduct.price * amount;

          // Update stock
          checkProduct.amount -= amount;
          await this.stockCarRepository.save(checkProduct);
        }

        const savedDeliveryDetails = [];
        for (const detail of deliveryDetailArray) {
          const saved = await this.deliveryDetailRepository.save(detail);
          savedDeliveryDetails.push(saved);
        }

        const drop_off_point = await this.dropOffPointRepository.findOne({
          where: { drop_id },
        });

        if (
          body.delivery_status === 'success' &&
          savedDeliveryDetails.length > 0 &&
          drop_off_point.line_id
        ) {
          await this.moneyRepository.save({
            date_time: new Date(),
            dateString: format(new Date(), 'yyyy-MM-dd'),
            amount: priceAmount,
            line: { line_id: drop_off_point.line_id },
          });
        }
      }

      const drop_off_point = await this.dropOffPointRepository.findOne({
        where: { drop_id },
      });

      if (!drop_off_point) {
        return {
          success: false,
          message: 'Drop-off point not found',
        };
      }

      drop_off_point.drop_status = body.delivery_status;
      await this.dropOffPointRepository.save(drop_off_point);

      return {
        success: true,
        message: 'Update Delivery Status Success',
      };
    } catch (error) {
      console.error('Delivery update error:', error);
      return {
        success: false,
        message: error.message || 'Internal server error',
      };
    }
  }
}
