# NestJS Advanced Features Demo

A comprehensive demonstration of NestJS advanced concepts including custom decorators, guards, exception filters, and testing best practices.

## 🚀 Features Implemented

### 1. Custom Decorators
- **`@CurrentUser()`** - Extracts current user from JWT token
- **`@Roles(...roles)`** - Specifies required roles for route access
- **`@Public()`** - Marks routes as public (no authentication required)
- **`@RequestMetadata()`** - Extracts request metadata (IP, user agent, etc.)

### 2. Advanced Guards
- **`JwtAuthGuard`** - JWT authentication with public route support
- **`RolesGuard`** - Role-based access control
- **`OwnershipGuard`** - Ensures users can only access their own resources

### 3. Exception Filters
- **`GlobalExceptionFilter`** - Catches all exceptions with structured responses
- **`ValidationExceptionFilter`** - Detailed validation error responses

### 4. Comprehensive Testing
- **E2E Tests** - Full integration testing with authentication scenarios
- **Unit Tests** - Service and guard testing with mocks
- **Mock Implementations** - Isolated testing of external dependencies

## 🏗️ Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── guards/             # Auth-specific guards
│   ├── strategies/         # Passport strategies
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module configuration
├── users/                  # Users module
│   ├── users.controller.ts # User management endpoints
│   ├── users.service.ts    # User business logic
│   └── users.module.ts     # Users module configuration
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── guards/            # Reusable guards
│   ├── filters/           # Exception filters
│   ├── dto/               # Data transfer objects
│   └── types/             # TypeScript interfaces
└── main.ts                # Application entry point
```

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   export JWT_SECRET=your-secret-key
   ```

3. **Run the application:**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - User login (public)

### User Management
- `POST /users` - Create user (public)
- `GET /users` - Get all users (admin/moderator only)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID (own profile or admin)
- `PATCH /users/:id` - Update user (own profile or admin)
- `DELETE /users/:id` - Delete user (admin only)

## 🔐 Security Features

### Role-Based Access Control
```typescript
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Get('admin-only')
adminOnlyRoute() {
  return 'Admin access granted';
}
```

### Ownership Protection
```typescript
@UseGuards(OwnershipGuard)
@Get(':id')
getUserProfile(@Param('id') id: string) {
  // Users can only access their own profile
  // Admins can access any profile
}
```

### Public Routes
```typescript
@Public()
@Post('register')
register(@Body() createUserDto: CreateUserDto) {
  // No authentication required
}
```

## 🎯 Advanced Concepts Demonstrated

### 1. Custom Decorators

#### Current User Decorator
```typescript
@Get('profile')
getProfile(@CurrentUser() user: UserPayload) {
  return user; // Automatically extracts user from JWT
}

@Get('user-id')
getUserId(@CurrentUser('sub') userId: string) {
  return { userId }; // Extract specific field
}
```

#### Request Metadata Decorator
```typescript
@Get('info')
getInfo(@RequestMetadata() metadata: any) {
  return {
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    timestamp: metadata.timestamp
  };
}
```

### 2. Advanced Guards

#### JWT Authentication Guard
```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
protectedRoute() {
  return 'This route requires authentication';
}
```

#### Role-Based Guard
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin')
adminRoute() {
  return 'Admin only route';
}
```

### 3. Exception Filters

#### Global Exception Filter
```typescript
// Automatically catches all exceptions and returns structured responses
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequestException",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/users"
}
```

### 4. Testing with Mocks

#### Service Testing
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  
  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    
    // Test implementation with mocked dependencies
  });
});
```

#### E2E Testing
```typescript
describe('UsersController (e2e)', () => {
  it('should fail for regular user (insufficient role)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
      
    expect(response.body.message).toContain('Access denied');
  });
});
```

## 🔧 Configuration

### JWT Configuration
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '1h' },
})
```

### Validation Pipe
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

## 📝 Usage Examples

### Creating a Protected Route
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Get('users')
  getAllUsers(@CurrentUser() user: UserPayload) {
    return this.usersService.findAll();
  }
}
```

### Handling Validation Errors
```typescript
@Post('users')
async createUser(@Body() createUserDto: CreateUserDto) {
  // ValidationPipe automatically validates the DTO
  // GlobalExceptionFilter handles validation errors
  return this.usersService.create(createUserDto);
}
```

### Testing Protected Routes
```typescript
it('should access protected route with valid token', async () => {
  const response = await request(app.getHttpServer())
    .get('/protected')
    .set('Authorization', `Bearer ${validToken}`)
    .expect(200);
});
```

## 🎓 Learning Outcomes

This project demonstrates:

1. **Custom Decorators** - How to create reusable decorators for common functionality
2. **Advanced Guards** - Implementing complex authentication and authorization logic
3. **Exception Filters** - Creating consistent error handling across the application
4. **Testing Strategies** - E2E testing with authentication and unit testing with mocks
5. **Security Best Practices** - Role-based access control and ownership validation
6. **NestJS Architecture** - Proper module organization and dependency injection

## 🚀 Next Steps

- Add database integration (TypeORM/Prisma)
- Implement refresh token mechanism
- Add rate limiting
- Implement audit logging
- Add API documentation with Swagger
- Add Docker configuration
- Implement caching strategies

## 📄 License

MIT License - feel free to use this project for learning and development purposes.
