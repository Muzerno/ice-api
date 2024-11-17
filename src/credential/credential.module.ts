import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule],
  controllers: [CredentialController],
  providers: [CredentialService, JwtService],
})
export class CredentialModule { }
