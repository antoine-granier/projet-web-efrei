import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../models/user.model';
import { isValidEmail } from '../utils';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Store,
    private prisma: PrismaService,
  ) {}

  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cache = await this.cacheManager.get<T>(key);
      if (cache) {
        return cache;
      }
    } catch (error) {
      console.error(`Error getting cache for key: ${key}`, error);
    }
    return null;
  }

  private async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      await this.cacheManager.set(key, data);
    } catch (error) {
      console.error(`Error setting cache for key: ${key}`, error);
    }
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'users';
    const cache = await this.getCachedData<User[]>(cacheKey);
    if (cache) {
      return cache;
    }

    const users = await this.prisma.user.findMany();
    await this.setCachedData(cacheKey, users);
    return users;
  }

  async findById(userId: string): Promise<User | null> {
    const cacheKey = `users-${userId}`;
    const cache = await this.getCachedData<User>(cacheKey);
    if (cache) {
      return cache;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }

    await this.setCachedData(cacheKey, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const cacheKey = `users-${email}`;
    const cache = await this.getCachedData<User>(cacheKey);
    if (cache) {
      return cache;
    }

    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return null;
    }

    await this.setCachedData(cacheKey, user);
    return user;
  }

  async create(name: string, email: string, password: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    
    let user: User;
    try {
      user = await this.prisma.user.create({
        data: { name, email, password },
      });
    } catch (error) {
      console.error(`Error creating user with email: ${email}`, error);
      throw new HttpException(
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }


    await this.setCachedData(`users-${user.id}`, user);
    const users = await this.prisma.user.findMany();
    await this.setCachedData('users', users);

    return user;
  }
}
