import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { NormalPoint } from 'src/entity/normal_point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, NormalPoint])],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
