import { Module } from '@nestjs/common';
import { ManufactureService } from './manufacture.service';
import { ManufactureController } from './manufacture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { Product } from 'src/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Manufacture, ManufactureDetail, Product])],
  controllers: [ManufactureController],
  providers: [ManufactureService],
})
export class ManufactureModule { }
