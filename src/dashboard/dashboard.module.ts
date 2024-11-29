import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Product } from 'src/entity/product.entity';
import { Customer } from 'src/entity/customer.entity';
import { Delivery } from 'src/entity/delivery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Customer, Delivery])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
