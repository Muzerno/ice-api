import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransportationModule } from './transportation/transportation.module';
import { CredentialModule } from './credential/credential.module';
import { RoleModule } from './role/role.module';
import databaseConfig from './config/database.config';
import { JwtModule } from '@nestjs/jwt';
import appConfig from './config/app.config';


@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', load: [databaseConfig, appConfig] }),
    JwtModule.register({
      secret: appConfig().jwtSecret ?? 'icefactory',
      global: true,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    UserModule,
    CustomerModule,
    ProductModule,
    TransportationModule,
    CredentialModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }