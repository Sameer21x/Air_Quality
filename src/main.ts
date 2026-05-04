import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix ────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation pipe ──────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // ── CORS ─────────────────────────────────────────────────────
  app.enableCors({ origin: '*' });

  // ── Swagger ──────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Air Quality Monitoring API')
    .setDescription(
      `Real-time PM2.5 / PM10 / AQI monitoring API.\n\n` +
      `**Data flow:** MATLAB sensor → POST /api/readings/ingest → Supabase + Power BI push\n\n` +
      `**WebSocket:** Connect to \`ws://localhost:3000/ws\` for live readings.`
    )
    .setVersion('1.0.0')
    .addTag('Readings', 'Ingest and query sensor readings')
    .addTag('Analytics', '24-hour stats and hourly trend data')
    .addTag('System', 'Health check and metadata')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Air Quality API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n════════════════════════════════════════`);
  console.log(`  Air Quality API running`);
  console.log(`  REST    → http://localhost:${port}/api`);
  console.log(`  Swagger → http://localhost:${port}/api/docs`);
  console.log(`  WS      → ws://localhost:${port}/ws`);
  console.log(`════════════════════════════════════════\n`);
}
bootstrap();