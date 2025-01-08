import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ManufactureService } from './manufacture.service';
import { ICreateManufacture } from './validator/validator';
import { Response } from 'express';

@Controller('manufacture')
export class ManufactureController {
  constructor(private readonly manufactureService: ManufactureService) { }

  @Post()
  async create(@Body() body: ICreateManufacture,) {

    await this.manufactureService.create(body);
    return { success: true, message: "Create Manufacture Success" };
  }

  @Get()
  async findAll(@Query() query: { date: string }) {

    return await this.manufactureService.findAll(query.date);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.manufactureService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: ICreateManufacture) {
    return await this.manufactureService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.manufactureService.remove(id);
  }
}
