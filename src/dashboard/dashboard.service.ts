import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Customer } from 'src/entity/customer.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { DeliveryDetail } from 'src/entity/delivery_detail.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { Money } from 'src/entity/money.entity';
import { Product } from 'src/entity/product.entity';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { User } from 'src/entity/user.entity';
import { Withdraw } from 'src/entity/withdraw.entity';
import { TransportationService } from 'src/transportation/transportation.service';
import { Between, ILike, Repository } from 'typeorm';
import { ExportRequest } from './interface/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Money)
    private readonly moneyRepository: Repository<Money>,

    @InjectRepository(Manufacture)
    private readonly manufactureRepository: Repository<Manufacture>,

    @InjectRepository(ManufactureDetail)
    private readonly manufactureDetailRepository: Repository<ManufactureDetail>,

    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,

    @InjectRepository(DeliveryDetail)
    private readonly deliveryDetailRepository: Repository<DeliveryDetail>,

    @InjectRepository(DropOffPoint)
    private readonly dropOffPointRepository: Repository<DropOffPoint>,

    @InjectRepository(Withdraw)
    private readonly withdrawRepository: Repository<Withdraw>,

    @InjectRepository(Line)
    private readonly lineRepository: Repository<Line>,

    @InjectRepository(Transportation_Car)
    private readonly transportationRepository: Repository<Transportation_Car>,
  ) { }

  async getDashboard() {
    const countUser = await this.userRepository.count();
    const countProduct = await this.productRepository.count();
    const countCustomer = await this.customerRepository.count();
    const countCar = await this.transportationRepository.count();

    const today = format(new Date(), 'yyyy-MM-dd');

    const totalSell = await this.moneyRepository
      .createQueryBuilder('money')
      .select('SUM(money.amount) as totalSell')
      .where('date_time >= :startDay AND date_time <= :endDay', {
        startDay: format(new Date(), 'yyyy-MM-dd') + ' 00:00:00',
        endDay: format(new Date(), 'yyyy-MM-dd') + ' 23:59:59',
      })
      .getRawOne();

    const countManufactureDetail = await this.manufactureDetailRepository
      .createQueryBuilder('detail')
      .innerJoin('detail.manufacture', 'manufacture')
      .where('DATE(manufacture.date_time) = :date', { date: today })
      .getCount();

    const countSuccessDelivery = await this.dropOffPointRepository.count({
      where: {
        drop_status: 'success',
        date_drop: ILike(`%${format(new Date(), 'yyyy-MM-dd')}%`) as any, // Cast to any to bypass type checking
      },
    });

    const countCancelDelivery = await this.dropOffPointRepository.count({
      where: {
        drop_status: 'cancel',
        date_drop: ILike(`%${format(new Date(), 'yyyy-MM-dd')}%`) as any, // Cast to any to bypass type checking
      },
    });

    return {
      countUser: countUser,
      countProduct: countProduct,
      countCustomer: countCustomer,
      totalSell: totalSell.totalSell,
      countManufactureDetail: countManufactureDetail,
      countSuccessDelivery: countSuccessDelivery,
      countCancelDelivery: countCancelDelivery,
      countCar: countCar,
    };
  }

  async getMoney(body: { date_time: string }) {
    const moneyRes = await this.moneyRepository
      .createQueryBuilder('money')
      .leftJoin('money.line', 'line')
      .leftJoin('line.transportation_car', 'car')
      .leftJoin('car.users', 'driver')
      .select([
        'DATE(money.date_time) as date_time',
        'SUM(money.amount) as total',
        'car.car_number as car_number',
        'car.car_id as car_id',
        'driver.firstname as firstname',
        'driver.lastname as lastname',
      ])
      .where(`money.date_time >= :startDay AND money.date_time <= :endDay`, {
        startDay: body.date_time + ' 00:00:00',
        endDay: body.date_time + ' 23:59:59',
      })
      .groupBy('DATE(money.date_time)')
      .addGroupBy('car.car_number')
      .addGroupBy('car.car_id')
      .addGroupBy('driver.id')
      .getRawMany();

    const res = await Promise.all(
      moneyRes.map(async (item) => {
        const findLine = await this.lineRepository.findOne({
          where: { car_id: item.car_id },
        });

        const deliveryDetails = await this.deliveryDetailRepository
          .createQueryBuilder('delivery_detail')
          .leftJoinAndSelect('delivery_detail.dropoffpoint', 'dropoffpoint')
          .leftJoinAndSelect('dropoffpoint.customer', 'customer')
          .leftJoinAndSelect('delivery_detail.product', 'product')
          .where('delivery_detail.car_id = :carId', { carId: item.car_id })
          .andWhere('DATE(delivery_detail.delivery_date) = :date', {
            date: item.date_time,
          })
          .getMany();

        return {
          ...item,
          line_name: findLine ? findLine.line_name : null,
          delivery: deliveryDetails,
        };
      }),
    );

    return res;
  }

  async updateLocation(
    car_id: number,
    location: { latitude: string; longitude: string },
  ) {
    return this.transportationRepository.update(
      { car_id },
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    );
  }

  async getCarLocation() {
    const res = await this.transportationRepository.find({
      relations: ['users'],
    });
    return res;
  }

  async export(body: ExportRequest) {
    if (body.type === 'manufacture') {
      const res = await this.manufactureDetailRepository
        .createQueryBuilder('manufacture_detail')
        .leftJoinAndSelect('manufacture_detail.products', 'products')
        .leftJoinAndSelect('manufacture_detail.manufacture', 'manufacture') // JOIN ก่อน where
        .where('manufacture.date_time BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        })
        .getMany();

      return res;
    }
    if (body.type === 'withdraw') {
      const findCar = await this.transportationRepository
        .createQueryBuilder('transportation')
        .where('line.line_id = :carId', { carId: body.line })
        .leftJoin(
          'transportation.Lines',
          'line',
          'transportation.car_id = line.car_id',
        )
        .getOne();

      const Query = this.withdrawRepository
        .createQueryBuilder('withdraw')
        .leftJoinAndSelect('withdraw.withdraw_details', 'withdraw_details')
        .leftJoinAndSelect('withdraw.transportation_car', 'car')
        .leftJoinAndSelect('car.Lines', 'line')
        .leftJoinAndSelect('withdraw_details.product', 'product');
      if (body.line) {
        const findCar = await this.transportationRepository
          .createQueryBuilder('transportation')
          .leftJoin(
            'transportation.Lines',
            'line',
            'transportation.car_id = line.car_id',
          )
          .where('line.line_id = :carId', { carId: body.line })
          .getOne();

        if (!findCar) {
          throw new Error(`ไม่พบรถที่ตรงกับ line_id = ${body.line}`);
        }

        Query.where('withdraw.car_id = :lineId', { lineId: findCar.car_id });
        Query.andWhere('withdraw.date_time BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        });
      } else {
        Query.where('withdraw.date_time BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        });
      }
      const res = Query.getMany();
      return res;
    }
    if (body.type === 'money') {
      const findCar = await this.transportationRepository
        .createQueryBuilder('transportation')
        .where('line.line_id = :carId', { carId: body.line })
        .leftJoin(
          'transportation.Lines',
          'line',
          'transportation.car_id = line.car_id',
        )
        .getOne();

      const Query = this.moneyRepository
        .createQueryBuilder('money')
        .leftJoin('money.line', 'line')
        .leftJoin('line.dropOffPoints', 'dropoffpoint')
        .leftJoin('dropoffpoint.delivery_details', 'delivery_details')
        .leftJoin('delivery_details.product', 'product')
        .leftJoin('dropoffpoint.customer', 'customer')
        .leftJoin('delivery_details.car', 'car')
        .leftJoin('car.Lines', 'carLine')
        .addSelect([
          'line',
          'dropoffpoint',
          'delivery_details',
          'product',
          'customer',
          'car',
          'carLine',
        ]);

      if (findCar) {
        Query.where('delivery_details.car_id = :lineId', {
          lineId: findCar.car_id,
        });
        Query.andWhere('money.date_time BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        });
      } else {
        Query.where('money.date_time BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        });
      }

      const res = await Query.getMany();
      return res;
    }

    if (body.type === 'delivery') {
      const findCar = await this.transportationRepository
        .createQueryBuilder('transportation')
        .where('line.line_id = :carId', { carId: body.line })
        .leftJoin(
          'transportation.Lines',
          'line',
          'transportation.car_id = line.car_id',
        )
        .getOne();

      const Query = this.dropOffPointRepository
        .createQueryBuilder('dropoffpoint')
        .where('dropoffpoint.date_drop BETWEEN :startDay AND :endDay', {
          startDay: `${body.date_from} 00:00:00`,
          endDay: `${body.date_to} 23:59:59`,
        })
        .leftJoinAndSelect('dropoffpoint.line', 'line')
        .leftJoinAndSelect('dropoffpoint.car', 'car')
        .leftJoinAndSelect('dropoffpoint.customer', 'customer');

      if (findCar) {
        Query.andWhere('dropoffpoint.car_id = :carId', {
          carId: findCar.car_id,
        });
      }
      const res = await Query.getMany();
      return res;
    }
  }
}
