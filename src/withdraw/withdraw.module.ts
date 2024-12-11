import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from 'src/entity/withdraw.entity';
import { WithdrawDetail } from 'src/entity/withdraw_detail.entity';
import { Product } from 'src/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw, WithdrawDetail, Product])],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule { }
