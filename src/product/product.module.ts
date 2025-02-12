import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entity/product.entity';
import { StockCar } from 'src/entity/stock_car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockCar])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
