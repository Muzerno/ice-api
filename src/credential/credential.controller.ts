import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { ICreateCredential } from './validator/validator';
import { Response } from 'express'

@Controller('auth')
export class CredentialController {
  constructor(
    private readonly authService: CredentialService,
  ) { }

  @Post('login')
  async login(@Body() credentials: ICreateCredential, @Res() res: Response) {
    const user = await this.authService.validateUser(
      credentials.username,
      credentials.password,
    );
    console.log(user)
    if (!user) {
      res.status(HttpStatus.NO_CONTENT)
      res.json({ success: false, error: 'Invalid credentials' });
      return
    }
    const payload = await this.authService.login(user);
    res.status(HttpStatus.OK);
    res.json({ success: true, payload: payload });
  }
}