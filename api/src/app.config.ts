import { INestApplication } from '@nestjs/common';

export function configureApp(app: INestApplication): void {
  app.enableCors({ origin: 'http://localhost:5173' });
}
