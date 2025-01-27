import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TransportationService } from './transportation.service';
import { ICreateCar, ICreateLine } from './validator/validator';
import { UUID } from 'crypto';

@Controller('transportation')
export class TransportationController {
  constructor(private readonly transportationService: TransportationService) { }
  @Post('car')
  async createCar(@Body() body: ICreateCar) {
    try {
      await this.transportationService.createCar(body);
      return { success: true, message: 'Car created successfully' };
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
        data: cars
      }

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
        data: car
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put('car/:id')
  async updateCar(@Param('id') id: number, @Body() body: any) {
    try {
      await this.transportationService.updateCar(id, body);
      return { message: 'Car updated successfully' };
    } catch (error) {
      throw new Error(error.message);
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

  @Post()
  async createLine(@Body() body: ICreateLine) {
    return this.transportationService.createLine(body);
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
  async getLineByCar(@Param('car_id') car_id: number) {
    return this.transportationService.getLineByCarId(car_id);
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

  @Patch('update/DaliveryStatus/:id')
  async updateDeliveryStatus(@Param('id') id: number, @Body() body: { status: string, latitude: number, longitude: number }) {
    return this.transportationService.updateDeliveryStatus(id, body);
  }
}
