import { Customer } from 'src/entity/customer.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  HttpStatus,
  HttpException,
  ParseIntPipe
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { ICreateOrderVip, IReqCreateWithdraw } from './validator/validator';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) { }

  @Get()
  async findAll(@Query('date') date: string) {
    const withdraws = await this.withdrawService.findAllWithdraws(date);
    return {
      success: true,
      data: withdraws,
    };
  }

  @Post()
  async create(@Body() createWithdrawDto: IReqCreateWithdraw) {
    const res = await this.withdrawService.createWithdraw(createWithdrawDto);
    return {
      success: true,
      data: res,
    };
  }

  @Post('/vip')
  async createVip(@Body() createWithdrawDto: ICreateOrderVip) {
    const res = await this.withdrawService.createOrderVip(createWithdrawDto);
    return {
      success: true,
      data: res,
    };
  }

  @Get('/vip')
  async findAllVip() {
    const withdraws = await this.withdrawService.findAllOrdeVip();
    return {
      success: true,
      data: withdraws,
    };
  }

  @Get('/vip-order/:car_id')
  async getVipOrdersByCarId(@Param('car_id', ParseIntPipe) car_id: number) {
    const customers = await this.withdrawService.findOrderVipByCarId(car_id);
    return {
      success: true,
      data: customers,
    };
  }


  @Get('/new-id')
  async getNewCustomerId() {
    const result = await this.withdrawService.generateNewCustomerId();
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      newCustomerId: result.newCustomerId,
    };
  }

  @Delete('/vip/:customer_id')
  async removeOrderVip(@Param('customer_id') customer_id: string) {
    await this.withdrawService.removeOrderVip(customer_id);
    return {
      success: true,
      message: 'Delete Customer Success',
    };
  }

}


