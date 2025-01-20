import { Module } from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { TransportationController } from './transportation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { DropOffPoint } from 'src/entity/drop_off_point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transportation_Car, Line, DropOffPoint])],
  controllers: [TransportationController],
  providers: [TransportationService],
})
export class TransportationModule { }
