import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../types/user.types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);

    mockRequest = {
      user: {
        sub: '1',
        email: 'test@example.com',
        role: UserRole.USER,
      },
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.USER, UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => guard.canActivate(mockContext))
        .toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      mockRequest.user = null;

      expect(() => guard.canActivate(mockContext))
        .toThrow(ForbiddenException);
    });

    it('should include role information in error message', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error.message).toContain('Required roles: admin');
        expect(error.message).toContain('Your role: user');
      }
    });
  });
});
