import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserRole } from '../common/types/user.types';
import { CreateUserDto } from '../common/dto/create-user.dto';
import { UpdateUserDto } from '../common/dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestMetadata } from '../common/decorators/request-metadata.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiResponse } from '../common/types/api-response.types';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @RequestMetadata() metadata: any) {
    const user = await this.usersService.create(createUserDto);
    
    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: '/users',
    };

    return response;
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get()
  async findAll(@CurrentUser() currentUser: any) {
    const users = await this.usersService.findAll();
    
    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      timestamp: new Date().toISOString(),
      path: '/users',
    };

    return response;
  }

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: any) {
    const user = await this.usersService.findById(currentUser.sub);
    
    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: '/users/profile',
    };

    return response;
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: `/users/${id}`,
    };

    return response;
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    
    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: `/users/${id}`,
    };

    return response;
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
      path: `/users/${id}`,
    };

    return response;
  }
}
