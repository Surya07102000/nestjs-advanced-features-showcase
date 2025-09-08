import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
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
  
  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 Swagger UI is available at: http://localhost:3000/api');
  console.log('🔐 Test Users:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User:  user@example.com / password123');
}
bootstrap();
