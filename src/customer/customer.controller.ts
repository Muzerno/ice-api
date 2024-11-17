import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ICreateCustomer } from './validator/validator';
import { UUID } from 'crypto';


@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post()
  async create(@Body() body: ICreateCustomer) {
    await this.customerService.create(body);
    return {
      success: true,
      message: "Create Customer Success"
    }
  }

  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    return {
      success: true,
      data: customers
    }
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: UUID) {
    const customer = await this.customerService.findOne(uuid);
    return {
      success: true,
      data: customer
    }
  }

  @Patch(':uuid')
  async update(@Param('uuid') uuid: UUID, @Body() body: ICreateCustomer) {
    await this.customerService.update(uuid, body);
    return {
      success: true,
      message: "Update Customer Success"
    }
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: UUID) {
    await this.customerService.remove(uuid);
    return {
      success: true,
      message: "Delete Customer Success"
    }
  }
}
