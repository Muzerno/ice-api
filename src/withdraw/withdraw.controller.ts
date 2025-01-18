import { Body, Controller, Get, Post } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { IReqCreateWithdraw } from './validator/validator';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {
  }

  @Get()
  async findAll() {
    const withdraws = await this.withdrawService.findAllWithdraws();
    return {
      success: true,
      data: withdraws
    }
  }

  @Post()
  async create(@Body() createWithdrawDto: IReqCreateWithdraw) {
    const res = await this.withdrawService.createWithdraw(createWithdrawDto);
    return {
      success: true,
      data: res
    }
  }
}
