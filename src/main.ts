import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Air Quality Monitoring API')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init(); // Critical: Initialize but don't listen on a port here
  return app.getHttpAdapter().getInstance(); // Export the underlying Express/Fastify instance
}

// Only call listen if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(instance => {
    const port = process.env.PORT ?? 3000;
    instance.listen(port);
  });
}