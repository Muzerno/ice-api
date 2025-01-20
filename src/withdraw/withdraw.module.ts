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
import { Line } from 'src/entity/transportation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Withdraw, WithdrawDetail, Product, OrderCustomer, Line,
    OrderCustomerDetail, DropOffPoint])],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule { }
