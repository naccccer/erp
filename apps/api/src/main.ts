import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const resolvedPort = Number.isNaN(port) ? 3000 : port;
  app.enableShutdownHooks();
  await app.listen(resolvedPort);
}

void bootstrap();
