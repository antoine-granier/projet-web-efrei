import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { isValidEmail } from '../utils';
import { AuthGuard } from '../auth/auth.guard';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @UseGuards(AuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getUserById(@Args('userId') userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getUserByEmail(@Args('email') email: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findByEmail(email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
}
