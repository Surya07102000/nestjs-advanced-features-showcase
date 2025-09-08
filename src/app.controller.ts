import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get application info',
    description: 'Returns basic information about the application'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application information',
    schema: {
      type: 'string',
      example: 'NestJS Advanced Features Demo - User Management System'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
