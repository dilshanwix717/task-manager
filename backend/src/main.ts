import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = [
    'http://localhost:3000', // next.js dev server
    'http://frontend:3000', // docker internal network
  ];

  if (process.env.FRONTEND_URL) corsOrigins.push(process.env.FRONTEND_URL);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Tracker API')
    .setDescription('API Documentation for the Task Tracker application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-documentation', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // This removes properties not in DTO
      forbidNonWhitelisted: false, // Set to false to allow extra properties
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
