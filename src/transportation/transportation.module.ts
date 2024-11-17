import { Module } from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { TransportationController } from './transportation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Transportation_line } from 'src/entity/transportation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transportation_Car, Transportation_line])],
  controllers: [TransportationController],
  providers: [TransportationService],
})
export class TransportationModule { }
