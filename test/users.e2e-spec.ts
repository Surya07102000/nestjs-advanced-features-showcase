import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { UserRole } from '../src/common/types/user.types';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    // Get admin token
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.data.access_token;

    // Get user token
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userLogin.body.data.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user (public endpoint)', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        role: UserRole.USER,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(createUserDto.email);
      expect(response.body.data.username).toBe(createUserDto.username);
    });

    it('should fail with validation errors', async () => {
      const createUserDto = {
        email: 'invalid-email',
        username: 'ab', // too short
        password: '123', // too short
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('/users (GET)', () => {
    it('should get all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail for regular user (insufficient role)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toContain('Access denied');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('/users/profile (GET)', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('user@example.com');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get user by id (own profile)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('2');
    });

    it('should fail to access other user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toContain('You can only access your own resources');
    });

    it('should allow admin to access any user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('2');
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update own profile', async () => {
      const updateDto = {
        username: 'updateduser',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('updateduser');
    });

    it('should fail to update other user profile', async () => {
      const updateDto = {
        username: 'hacked',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateDto)
        .expect(403);

      expect(response.body.message).toContain('You can only access your own resources');
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user (admin only)', async () => {
      // First create a user to delete
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'todelete@example.com',
          username: 'todelete',
          password: 'password123',
        });

      const userId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toContain('Access denied');
    });
  });
});
