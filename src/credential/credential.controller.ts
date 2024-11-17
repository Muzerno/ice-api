import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { JwtService } from '@nestjs/jwt';
import { ICreateCredential } from './validator/validator';

@Controller('auth')
export class CredentialController {
  constructor(
    private readonly authService: CredentialService,
  ) { }

  @Post('login')
  async login(@Body() credentials: ICreateCredential) {
    const user = await this.authService.validateUser(
      credentials.username,
      credentials.password,
    );
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    const token = await this.authService.login(user);
    return token;
  }
}