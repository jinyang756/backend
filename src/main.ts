import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // 设置全局API前缀，例如：http://localhost:3000/api/users
  await app.listen(3001); // 后端监听端口，避免与前端3000端口冲突
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
