import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/jwt-auth.guard';
import { isValidEmail } from '../utils';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User)
  async getUserById(@Args('userId') userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  @Query(() => User)
  async getUserByEmail(@Args('email') email: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findByEmail(email);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  @Mutation(() => User)
  async createUser(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<User> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new HttpException('User exist', HttpStatus.CONFLICT);
    }
    return this.userService.create(name, email);
  }
}
