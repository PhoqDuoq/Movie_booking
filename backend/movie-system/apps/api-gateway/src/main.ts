import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8080'], // Support Vite and Lovable dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Setup proxy for user-service
  app.use(
    '/api/users',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api/users': '',
      },
    }),
  );

  // Setup proxy for catalog-service
  app.use(
    '/api/catalog',
    createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      pathRewrite: {
        '^/api/catalog': '',
      },
    }),
  );

  // Setup proxy for booking-service
  app.use(
    '/api/bookings',
    createProxyMiddleware({
      target: 'http://localhost:3003',
      changeOrigin: true,
      pathRewrite: {
        '^/api/bookings': '',
      },
    }),
  );

  // Setup proxy for payment-service
  app.use(
    '/api/payments',
    createProxyMiddleware({
      target: 'http://localhost:3004',
      changeOrigin: true,
      pathRewrite: {
        '^/api/payments': '',
      },
    }),
  );

  // You can add more proxies here for other services in the future

  await app.listen(3000);
}
bootstrap();
