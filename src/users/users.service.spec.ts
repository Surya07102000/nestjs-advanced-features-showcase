import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../common/types/user.types';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const result = await service.findAll();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.every(user => user.isActive)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return user with password when user exists', async () => {
      const result = await service.findById('1');
      
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.password).toBeDefined();
    });

    it('should return null when user does not exist', async () => {
      const result = await service.findById('999');
      
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user with password when user exists', async () => {
      const result = await service.findByEmail('admin@example.com');
      
      expect(result).toBeDefined();
      expect(result.email).toBe('admin@example.com');
      expect(result.password).toBeDefined();
    });

    it('should return null when user does not exist', async () => {
      const result = await service.findByEmail('nonexistent@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        role: UserRole.USER,
      };

      const result = await service.create(createUserDto);
      
      expect(result.email).toBe(createUserDto.email);
      expect(result.username).toBe(createUserDto.username);
      expect(result.role).toBe(UserRole.USER);
      expect(result.isActive).toBe(true);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        email: 'admin@example.com', // existing email
        username: 'newuser',
        password: 'password123',
      };

      await expect(service.create(createUserDto))
        .rejects.toThrow(ConflictException);
    });

    it('should default to USER role when not specified', async () => {
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      
      const createUserDto = {
        email: 'newuser2@example.com',
        username: 'newuser2',
        password: 'password123',
      };

      const result = await service.create(createUserDto);
      
      expect(result.role).toBe(UserRole.USER);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = {
        username: 'updateduser',
        role: UserRole.MODERATOR,
      };

      const result = await service.update('1', updateDto);
      
      expect(result.username).toBe('updateduser');
      expect(result.role).toBe(UserRole.MODERATOR);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateDto = {
        username: 'updateduser',
      };

      await expect(service.update('999', updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate user successfully', async () => {
      await service.remove('2');
      
      const user = await service.findById('2');
      expect(user.isActive).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.remove('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
