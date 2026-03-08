import 'reflect-metadata';

import { createServer } from 'node:http';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const resolvedPort = Number.isNaN(port) ? 3000 : port;

  const server = createServer((_request, response) => {
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ status: 'ok' }));
  });

  await new Promise<void>((resolve) => {
    server.listen(resolvedPort, resolve);
  });

  const shutdown = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await app.close();
  };

  process.once('SIGINT', () => {
    void shutdown();
  });
  process.once('SIGTERM', () => {
    void shutdown();
  });
}

void bootstrap();
