import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from 'src/entity/withdraw.entity';
import { WithdrawDetail } from 'src/entity/withdraw_detail.entity';
import { Product } from 'src/entity/product.entity';
import { OrderCustomer } from 'src/entity/order_customer.entity';
import { OrderCustomerDetail } from 'src/entity/order_customer_detail.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';
import { Customer } from 'src/entity/customer.entity';
import { Line } from 'src/entity/transportation.entity';
import { StockCar } from 'src/entity/stock_car.entity';
import { Transportation_Car } from 'src/entity/transport_car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Withdraw, WithdrawDetail, Product, OrderCustomer, Line, StockCar, Transportation_Car,
    OrderCustomerDetail, DropOffPoint,Customer])],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule { }
