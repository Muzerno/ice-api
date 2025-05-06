import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { ICreateOrderVip, IReqCreateWithdraw } from './validator/validator';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

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

  @Get('/vip/')
  async findAllVip() {
    const withdraws = await this.withdrawService.findAllOrdeVip();
    return {
      success: true,
      data: withdraws,
    };
  }

  @Delete('/vip/:customer_id')
  async removeOrderVip(@Param('customer_id') customer_id: number) {
    await this.withdrawService.removeOrderVip(customer_id);
    return {
      success: true,
      message: 'Delete Customer Success',
    };
  }
}
