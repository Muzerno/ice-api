import { Module } from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { TransportationController } from './transportation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { StockCar } from 'src/entity/stock_car.entity';
import { Delivery } from 'src/entity/delivery.entity';
import { DeliveryDetail } from 'src/entity/delivery_detail.entity';
import { Product } from 'src/entity/product.entity';
import { Money } from 'src/entity/money.entity';
import { NormalPoint } from 'src/entity/normal_point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transportation_Car, Line, DropOffPoint, StockCar, Delivery, DeliveryDetail, Product, Money,NormalPoint])],
  controllers: [TransportationController],
  providers: [TransportationService],
})
export class TransportationModule { }
