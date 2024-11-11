import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true ,envFilePath: '.env',load:[databaseConfig]}),
    TypeOrmModule.forRoot(databaseConfig()),
    UserModule,
    CustomerModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}