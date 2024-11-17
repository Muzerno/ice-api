import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: '*',
    allowedHeaders: '*',
    methods: '*',
  };
  app.use(cors(
    corsOptions
  ))
  await app.listen(process.env.PORT);
}
bootstrap();
