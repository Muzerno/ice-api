import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Product } from 'src/entity/product.entity';
import { Customer } from 'src/entity/customer.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { StockCar } from 'src/entity/stock_car.entity';
import { Money } from 'src/entity/money.entity';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { DeliveryDetail } from 'src/entity/delivery_detail.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { Withdraw } from 'src/entity/withdraw.entity';
import { Line } from 'src/entity/transportation.entity';
import { Transportation_Car } from 'src/entity/transport_car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Customer, Delivery,
    Money, Manufacture, Line, ManufactureDetail, Delivery, DeliveryDetail, DropOffPoint, Withdraw, Line, Transportation_Car,StockCar])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
