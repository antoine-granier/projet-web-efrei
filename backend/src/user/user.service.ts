import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';

@Injectable()
export class UserService {

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Store){}

  findAll(): User[] {
    return []
  }

  async findById(userId: string): Promise<User> {
    const cache = await this.cacheManager.get<User>(`users-${userId}`)
    if(cache) {
      return cache
    }
    throw new HttpException("User not found", HttpStatus.NOT_FOUND)
  }

  async create(name: string, email: string): Promise<User> {
    const user = { id: Date.now().toString(), name, email };
    await this.cacheManager.set(`users-${user.id}`, user)
    return user;
  }
}
