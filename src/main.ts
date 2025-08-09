import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { graphqlUploadExpress } from 'graphql-upload-ts';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true })); // enable class-validator exceptions
  app.use(graphqlUploadExpress({ overrideSendResponse: false, maxFileSize: 10485760, maxFiles: 10 })); // 10mb max file size and 10 files max
  app.enableCors();

  // capture "unhandled rejections" caused by unhandled promises errors in the application
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
  });

  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
