import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { ICreateCar, ICreateLine } from './validator/validator';
import { UUID } from 'crypto';
import { Response } from 'express';

@Controller('transportation')
export class TransportationController {
  constructor(private readonly transportationService: TransportationService) { }
  @Post('car')
  async createCar(@Body() body: ICreateCar, @Res() res: Response) {
    try {
      const result = await this.transportationService.createCar(body);
      if (result.success === false) {
        res.status(HttpStatus.NO_CONTENT);
        res.json({ success: false, message: result.message });
        return;
      }
      res.status(HttpStatus.CREATED);
      res.json({ success: true, message: 'Car created successfully' });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get('car')
  async getAllCar() {
    try {
      const cars = await this.transportationService.getAllCar();
      return {
        success: true,
        data: cars,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get('carWitLine')
  async getAllCarWithLine() {
    try {
      const carsWithLine = await this.transportationService.getAllCarWithLine();
      return {
        success: true,
        data: carsWithLine,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }


  @Get('car/:car_id')
  async getCar(@Param('car_id') car_id: number) {
    try {
      const car = await this.transportationService.getCar(car_id);
      return {
        success: true,
        data: car,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put('car/:car_id')
  async updateCar(@Param('car_id') car_id: number, @Body() body: any) {
    const result = await this.transportationService.updateCar(car_id, body);

    if (result.success === true) {
      return {
        success: true,
        message: 'Update Car Success',
      };
    } else {
      throw new BadRequestException(result.message || 'Update Car Failed');
    }
  }


  @Delete('car/:car_id')
  async deleteCar(@Param('car_id') car_id: number) {
    try {
      await this.transportationService.deleteCar(car_id);
      return { message: 'Car deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'ลบไม่สำเร็จ');
    }
  }


  @Post('line/add-customers')
  async addCustomersToLine(
    @Body()
    body: {
      line_id: number;
      customer_ids: { cus_id: number }[];
    }
  ) {
    return this.transportationService.addCustomersToLine(body);
  }

  @Post()
  async createLine(@Body() body: ICreateLine, @Res() res: Response) {
    try {
      const result = await this.transportationService.createLine(body);
      if (result?.success === false) {
        res.status(HttpStatus.BAD_REQUEST); // จาก NO_CONTENT → BAD_REQUEST
        res.json({ success: false, message: result.message });
        return;
      }
      res.status(HttpStatus.CREATED);
      res.json({
        success: true,
        message: 'สร้างสายเดินรถสำเร็จ',
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get()
  async getAllLines() {
    return this.transportationService.getAllLines();
  }


  @Get('line/byCar/:car_id')
  async getLineByCar(
    @Param('car_id') car_id: number,
    @Query('date') date: string,
  ) {
    return this.transportationService.getLineByCarId(car_id, date);
  }

  @Put(':id')
  async updateLine(@Param('id') id: number, @Body() body: any) {
    return this.transportationService.updateLine(id, body);
  }

  @Delete(':lineId/customer/:cusId')
  async removeCustomerFromLine(
    @Param('lineId') lineId: number,
    @Param('cusId') cusId: number,
  ) {
    return this.transportationService.removeCustomerFromLine(lineId, cusId);
  }

  @Patch('delete')
  async deleteLineWithArray(@Body() body: { ids: number[] }) {
    if (!Array.isArray(body.ids)) {
      throw new BadRequestException('ids must be an array');
    }
    return this.transportationService.deleteLineWithArray(body.ids);
  }

  @Patch('update/DeliveryStatus/:drop_id')
  async updateDeliveryStatus(
    @Param('drop_id', ParseIntPipe) drop_id: number,
    @Body()
    body: {
      products: number[];
      product_amount: Record<number, number>;
      car_id: number;
      delivery_status: string;
    },
  ) {
    return await this.transportationService.updateDeliveryStatus(drop_id, body);
  }

  @Patch(':line_id/update-steps')
  async updateCustomerSteps(
    @Param('line_id', ParseIntPipe) lineId: number,
    @Body() body: { customers: { cus_id: string; step: number }[] },
  ) {
    if (!body.customers || !Array.isArray(body.customers)) {
      throw new BadRequestException('ข้อมูล customers ไม่ถูกต้อง');
    }

    // ตรวจสอบว่าแต่ละ customer มี cus_id และ step
    for (const customer of body.customers) {
      if (!customer.cus_id || typeof customer.step !== 'number') {
        throw new BadRequestException('ข้อมูลลูกค้าไม่ครบถ้วน');
      }
    }

    try {
      const result = await this.transportationService.updateCustomerSteps(lineId, body.customers);

      return {
        success: true,
        message: result.message || 'อัปเดตลำดับลูกค้าเรียบร้อย',
      };
    } catch (error) {
      console.error(`[Controller] Error updating customer steps:`, error);
      throw new BadRequestException(error.message || 'เกิดข้อผิดพลาดในการอัปเดต');
    }
  }



}
