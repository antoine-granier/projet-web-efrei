import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  create(name: string, email: string): User {
    const user = { id: Date.now().toString(), name, email };
    this.users.push(user);
    return user;
  }
}
