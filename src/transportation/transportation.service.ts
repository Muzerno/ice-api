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

  async getCar(id: number) {
    try {
      const car = await this.transportationRepository.findOne({
        where: { id: id },
      });
      return car;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateCar(id: number, body) {
    try {
      const checkCar = await this.transportationRepository.findOne({
        where: {
          car_number: body.car_number,
          id: Not(id), // ยกเว้นตัวเอง
        },
      });

      if (checkCar) {
        return { success: false, message: 'Car number already exists' };
      }

      const checkDriver = await this.transportationRepository.findOne({
        where: {
          user_id: body.user_id,
          id: Not(id), // ยกเว้นตัวเอง
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
        .where({ id: id })
        .execute();

      return { success: true, message: 'Car updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteCar(id: number) {
    try {
      await this.transportationRepository
        .createQueryBuilder('transportation_car')
        .delete()
        .where({ id: id })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createLine(body: ICreateLine) {
    try {
      const existingLineName = await this.LineRepository.findOne({
        where: { line_name: body.line_name, car_id: body.car_id },
      });
      if (existingLineName) {
        return {
          success: false,
          message: 'Line name already exists for this car',
        };
      } else {
        const TsLine = [];
        const dropOff = [];
        for (const item of body.customer_id) {
          TsLine.push({
            line_name: body.line_name,
            car_id: body.car_id,
            customer_id: item,
          });
        }
        const result = await this.LineRepository.createQueryBuilder('Line')
          .insert()
          .values(TsLine)
          .execute();

        return { success: true, message: 'Line created successfully' };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllLines() {
    try {
      const lines = await this.LineRepository.find({
        relations: [
          'transportation_car',
          'customer',
          'transportation_car.users',
        ],
      });

      const lineMap = new Map();

      for (const line of lines) {
        const key = line.line_name; // ไม่รวม car_id

        if (!lineMap.has(key)) {
          lineMap.set(key, {
            ...line,
            customer: [{ ...line.customer, line_id: line.id }],
            lineArray: [line.id],
          });
        } else {
          const existing = lineMap.get(key);

          // เพิ่ม line.id ถ้ายังไม่มี
          if (!existing.lineArray.includes(line.id)) {
            existing.lineArray.push(line.id);
          }

          // เพิ่ม customer ถ้าไม่ซ้ำ (เลือกได้ว่าจะเช็ค id ซ้ำหรือไม่)
          existing.customer.push({ ...line.customer, line_id: line.id });
        }
      }

      return Array.from(lineMap.values());
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLineByCarId(carId: number, date: string) {
    try {
      const dropOffPoints = await this.dropOffPointRepository
        .createQueryBuilder('d')
        .where({ car_id: carId })
        .andWhere(`d.createAt BETWEEN :startDay AND :endDay`, {
          startDay: `${date} 00:00:00`,
          endDay: `${date} 23:59:59`,
        })
        // .leftJoinAndSelect('d.line', 'line') // ต้องมี relation นี้ใน Entity
        .leftJoinAndSelect('d.customer', 'customer')
        .leftJoinAndSelect('d.delivery_details', 'delivery_detail')
        .leftJoinAndSelect('delivery_detail.product', 'product_detail')
        .orderBy('d.createAt', 'DESC')
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
  async addCustomersToLine(body: {
    line_name: string;
    car_id: number;
    customer_ids: number[];
  }) {
    try {
      const TsLine = body.customer_ids.map((id) => ({
        line_name: body.line_name,
        car_id: body.car_id,
        customer_id: id,
      }));

      const result = await this.LineRepository.createQueryBuilder('Line')
        .insert()
        .values(TsLine)
        .execute();

      return {
        success: true,
        message: 'เพิ่มลูกค้าเข้าในสายเรียบร้อย',
        data: result,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getLine(id: number) {
    try {
      const line = await this.LineRepository.findOne({ where: { id: id } });
      return line;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateLine(id: number, body: any) {
    try {
      const result = await this.LineRepository.createQueryBuilder('Line')
        .update()
        .set({
          line_name: body.line_name,
          car_id: body.car_id,
          customer_id: body.customer_id,
        })
        .where('id = :id', { id })
        .execute();

      return { success: true, message: 'แก้ไขสายเดินรถสำเร็จ', data: result };
    } catch (error) {
      return { success: false, message: error.message };
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

  async deleteLineWithArray(id: number[]) {
    try {
      await this.LineRepository.createQueryBuilder('Line')
        .delete()
        .whereInIds(id)
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateDeliveryStatus(
    id: number,
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
            where: { id: stockId },
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
            drop_id: id,
            stock_car_id: stockId,
            amount: amount,
            ice_id: checkProduct.ice_id,
            delivery_status: body.delivery_status,
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

        if (
          body.delivery_status === 'success' &&
          savedDeliveryDetails.length > 0
        ) {
          await this.moneyRepository.save({
            date_time: new Date(),
            dateString: format(new Date(), 'yyyy-MM-dd'),
            amount: priceAmount,
            delivery_details: savedDeliveryDetails[0], // หรือใช้ delivery_id: savedDeliveryDetails[0].id ก็ได้
          });
        }
      }

      // อัปเดต drop_off_point ไม่ว่ามี product หรือไม่
      const drop_off_point = await this.dropOffPointRepository.findOne({
        where: { id },
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
