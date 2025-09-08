import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoginDto } from '../common/dto/login.dto';
import { ApiResponse } from '../common/types/api-response.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user and receive JWT token. Use the returned token in Authorization header for protected endpoints.'
  })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      admin: {
        summary: 'Admin login',
        value: { email: 'admin@example.com', password: 'password123' }
      },
      user: {
        summary: 'User login', 
        value: { email: 'user@example.com', password: 'password123' }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 201, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '1' },
                email: { type: 'string', example: 'admin@example.com' },
                username: { type: 'string', example: 'admin' },
                role: { type: 'string', example: 'admin' },
                isActive: { type: 'boolean', example: true }
              }
            }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/login' }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'UnauthorizedException' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/login' }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'email must be an email, password must be longer than or equal to 6 characters' },
        error: { type: 'string', example: 'BadRequestException' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/login' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    
    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString(),
      path: '/auth/login',
    };

    return response;
  }
}
