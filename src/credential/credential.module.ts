import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig().jwtSecret ?? "icefactory",
      global: true,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    UserModule],
  controllers: [CredentialController],
  providers: [CredentialService, JwtService],
})
export class CredentialModule { }
