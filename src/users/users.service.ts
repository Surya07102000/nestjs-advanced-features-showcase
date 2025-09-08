import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../common/types/user.types';
import { CreateUserDto } from '../common/dto/create-user.dto';
import { UpdateUserDto } from '../common/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // In-memory storage for demo purposes
  private users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      username: 'user',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private userPasswords: Map<string, string> = new Map([
    ['1', '$2b$10$ZIFKxlbPSTLJ.LJdBq7ZMOjnO5M4uUnKkEL2AmhVDkEsW22SSizSe'], // password123
    ['2', '$2b$10$ZIFKxlbPSTLJ.LJdBq7ZMOjnO5M4uUnKkEL2AmhVDkEsW22SSizSe'], // password123
  ]);

  async findAll(): Promise<User[]> {
    return this.users.filter(user => user.isActive);
  }

  async findById(id: string): Promise<User & { password: string } | null> {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    
    const password = this.userPasswords.get(id);
    return { ...user, password: password || '' };
  }

  async findByEmail(email: string): Promise<User & { password: string } | null> {
    const user = this.users.find(u => u.email === email);
    if (!user) return null;
    
    const password = this.userPasswords.get(user.id);
    return { ...user, password: password || '' };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      email: createUserDto.email,
      username: createUserDto.username,
      role: createUserDto.role || UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    this.userPasswords.set(newUser.id, hashedPassword);

    return newUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const user = this.users[userIndex];
    const updatedUser = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users[userIndex].isActive = false;
    this.userPasswords.delete(id);
  }
}
