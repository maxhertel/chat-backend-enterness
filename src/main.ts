import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Mudei a porta para não haver conflito pois será a porta da api
  await app.listen(3002);
}
bootstrap();
