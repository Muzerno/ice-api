import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ICreateCustomer } from './validator/validator';
import { UUID } from 'crypto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() body: ICreateCustomer) {
    await this.customerService.create(body);
    return {
      success: true,
      message: 'Create Customer Success',
    };
  }

  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    return {
      success: true,
      data: customers,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const customer = await this.customerService.findOne(id);
    return {
      success: true,
      data: customer,
    };
  }

  @Patch(':customer_id')
  async update(
    @Param('customer_id') customer_id: number,
    @Body() body: ICreateCustomer,
  ) {
    await this.customerService.update(customer_id, body);
    return {
      success: true,
      message: 'Update Customer Success',
    };
  }

  @Delete(':customer_id')
  async remove(@Param('customer_id') customer_id: number) {
    await this.customerService.remove(customer_id);
    return {
      success: true,
      message: 'Delete Customer Success',
    };
  }
}
