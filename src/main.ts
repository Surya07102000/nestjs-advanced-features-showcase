import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Helmet (sensible security headers)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // adapt if you maintain CSP
  }));

  // Security: CORS from environment
  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:3000'];
  const corsCredentials = (process.env.CORS_CREDENTIALS || 'true') === 'true';
  app.enableCors({
    origin: corsOrigin,
    credentials: corsCredentials,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With', process.env.CSRF_HEADER_NAME || 'X-XSRF-TOKEN'],
    exposedHeaders: ['Authorization'],
  });

  // Cookies for CSRF token and session-like features
  app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // CSRF Protection (for browser-based clients using cookies)
  // Uses double-submit cookie strategy; send header with value from cookie
  const csrfCookieName = process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN';
  const csrfHeaderName = process.env.CSRF_HEADER_NAME || 'X-XSRF-TOKEN';
  app.use(csurf({
    cookie: {
      key: csrfCookieName,
      httpOnly: false, // readable by JS to set header
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    value: (req: any) => req.headers[csrfHeaderName.toLowerCase()] as string,
  }));

  // Expose a simple endpoint to fetch CSRF token
  // Note: In Nest, simplest is to set header on all responses via middleware; here we also expose
  app.use((req, res, next) => {
    const token = (req as any).csrfToken ? (req as any).csrfToken() : undefined;
    if (token) {
      res.cookie(csrfCookieName, token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    next();
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Advanced Features API')
    .setDescription(`
      A comprehensive demonstration of NestJS advanced concepts including:
      - Custom Decorators (@CurrentUser, @Roles, @Public, @RequestMetadata)
      - Advanced Guards (JWT, Roles, Ownership)
      - Exception Filters (Global, Validation)
      - Role-based Access Control
      - User Management System
      
      ## Authentication
      Most endpoints require JWT authentication. Use the \`/auth/login\` endpoint to get a token, then include it in the Authorization header as \`Bearer <token>\`.
      
      ## User Roles
      - **admin**: Full access to all endpoints
      - **moderator**: Can view all users
      - **user**: Can only access own resources
      
      ## Pre-configured Test Users
      - **Admin**: \`admin@example.com\` / \`password123\`
      - **User**: \`user@example.com\` / \`password123\`
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management operations')
    .addTag('Health', 'Application health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'NestJS Advanced Features API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { background-color: #2c3e50; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
  });
  
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI is available at: http://localhost:${port}/api`);
  console.log('🔐 Test Users:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User:  user@example.com / password123');
}
bootstrap();
