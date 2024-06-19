import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Store, private prisma:PrismaService){}

  async findAll(): Promise<User[]> {
    const cache = await this.cacheManager.get<User[]>('users');
    if (cache) {
      return cache;
    }

    const users = await this.prisma.user.findMany();
    await this.cacheManager.set('users', users);
    return users;
  }

  async findById(userId: string): Promise<User> {
    const cache = await this.cacheManager.get<User>(`users-${userId}`);
    if (cache) {
      return cache;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(`users-${userId}`, user);
    return user;
  }

  async create(name: string, email: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: { name, email },
    });

    await this.cacheManager.set(`users-${user.id}`, user);
    const users = await this.prisma.user.findMany();
    await this.cacheManager.set('users', users);
    return user;
  }
}
