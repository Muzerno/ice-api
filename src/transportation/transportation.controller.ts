import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Get('car/:uuid')
  async getCar(@Param('uuid') uuid: UUID) {
    try {
      const car = await this.transportationService.getCar(uuid);
      return {
        success: true,
        data: car
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put('car/:uuid')
  async updateCar(@Param('uuid') uuid: UUID, @Body() body: any) {
    try {
      await this.transportationService.updateCar(uuid, body);
      return { message: 'Car updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete('cars/:uuid')
  async deleteCar(@Param('uuid') uuid: UUID) {
    try {
      await this.transportationService.deleteCar(uuid);
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

  @Get(':uuid')
  async getLine(@Param('uuid') uuid: UUID) {
    return this.transportationService.getLine(uuid);
  }

  @Put(':uuid')
  async updateLine(@Param('uuid') uuid: UUID, @Body() body: any) {
    return this.transportationService.updateLine(uuid, body);
  }

  @Delete(':uuid')
  async deleteLine(@Param('uuid') uuid: UUID) {
    return this.transportationService.deleteLine(uuid);
  }
}
