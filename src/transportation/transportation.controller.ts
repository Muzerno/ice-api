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
  constructor(private readonly transportationService: TransportationService) {}
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

  @Get('car/:id')
  async getCar(@Param('id') id: number) {
    try {
      const car = await this.transportationService.getCar(id);
      return {
        success: true,
        data: car,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put('car/:id')
  async updateCar(@Param('id') id: number, @Body() body: any) {
    const result = await this.transportationService.updateCar(id, body);

    if (result.success === true) {
      return {
        success: true,
        message: 'Update Car Success',
      };
    } else {
      throw new BadRequestException(result.message || 'Update Car Failed');
    }
  }

  @Delete('car/:id')
  async deleteCar(@Param('id') id: number) {
    try {
      await this.transportationService.deleteCar(id);
      return { message: 'Car deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post('line/add-customers')
  async addCustomersToLine(
    @Body() body: { line_name: string; car_id: number; customer_ids: number[] },
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

  @Get(':id')
  async getLine(@Param('id') id: number) {
    return this.transportationService.getLine(id);
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

  @Delete(':id')
  async deleteLine(@Param('id') id: number) {
    return this.transportationService.deleteLine(id);
  }

  @Patch('delete')
  async deleteLineWithArray(@Body() body: { ids: number[] }) {
    return this.transportationService.deleteLineWithArray(body.ids);
  }

  @Patch('update/DeliveryStatus/:id')
  async updateDeliveryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      products: number[]; // แก้จาก [] เป็น number[]
      product_amount: Record<number, number>; // ชัดเจนว่าเป็น object แบบใด
      car_id: number;
      delivery_status: string;
    },
  ) {
    return await this.transportationService.updateDeliveryStatus(id, body);
  }

  // @Post('/update/location/:car_id')
  // async updateLocation(@Param('car_id') car_id: number, @Body() body: { latitude: number, longitude: number }) {
  //   return this.transportationService.updateLocation(car_id, body);
  // }
}
