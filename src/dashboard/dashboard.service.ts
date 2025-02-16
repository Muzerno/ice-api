import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Customer } from 'src/entity/customer.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { Money } from 'src/entity/money.entity';
import { Product } from 'src/entity/product.entity';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { User } from 'src/entity/user.entity';
import { Withdraw } from 'src/entity/withdraw.entity';
import { ILike, Repository } from 'typeorm';

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
        const countUser = await this.userRepository.count()
        const countProduct = await this.productRepository.count()
        const countCustomer = await this.customerRepository.count()

        const totalSell = await this.moneyRepository
            .createQueryBuilder('money')
            .select('SUM(money.amount) as totalSell')
            .where('date_time >= :startDay AND date_time <= :endDay', { startDay: format(new Date(), 'yyyy-MM-dd') + " 00:00:00", endDay: format(new Date(), 'yyyy-MM-dd') + " 23:59:59" })
            .getRawOne()


        const countManufactureDetail = await this.manufactureDetailRepository.count({
            where: {
                date_time: ILike(`%${format(new Date(), 'yyyy-MM-dd')}%`) as any // Cast to any to bypass type checking
            },
        })

        const countSuccessDelivery = await this.dropOffPointRepository.count({
            where: {
                drop_status: "success",
                updateAt: ILike(`%${format(new Date(), 'yyyy-MM-dd')}%`) as any // Cast to any to bypass type checking
            }
        })

        const countCancelDelivery = await this.dropOffPointRepository.count({
            where: {
                drop_status: "cancel",
                updateAt: ILike(`%${format(new Date(), 'yyyy-MM-dd')}%`) as any // Cast to any to bypass type checking
            }
        })



        return {
            countUser: countUser,
            countProduct: countProduct,
            countCustomer: countCustomer,
            totalSell: totalSell.totalSell,
            countManufactureDetail: countManufactureDetail,
            countSuccessDelivery: countSuccessDelivery,
            countCancelDelivery: countCancelDelivery

        }
    }

    async getMoney() {
        const moneyRes = await this.moneyRepository.createQueryBuilder('money')
            .leftJoin('delivery', 'd', 'd.id = money.delevery_id')
            .leftJoin('car', 'c', 'c.id = d.car_id')
            .select([
                'DATE(money.date_time) as date_time',
                'SUM(money.amount) as total',
                'd.delivery_status as delivery_status',
                'c.car_number as car_number',
                'c.id as car_id'
            ])
            .addGroupBy('DATE(money.date_time)')
            .addGroupBy('d.delivery_status')
            .addGroupBy('c.car_number')
            .addGroupBy('c.id')
            .orderBy('date_time', 'DESC')
            .getRawMany();

        const res = await moneyRes.map(async (item) => {

            const findLine = await this.lineRepository.createQueryBuilder('line').where({ car_id: item.car_id }).getOne();



            return {
                ...item,
                line_name: findLine.line_name
            }
        });

        const result = await Promise.all(res);

        return result;
    }

    async updateLocation(carId: number, location: { latitude: string, longitude: string }) {
        return this.transportationRepository.update(carId, {
            latitude: location.latitude,
            longitude: location.longitude
        })
    }

    async getCarLocation() {
        const res = await this.transportationRepository.find({ where: { status: "active" } })
        return res
    }
}
