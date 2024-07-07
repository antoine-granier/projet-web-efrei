import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User)
  async getUserById(@Args('userId') userId: string): Promise<User> {
    return this.userService.findById(userId);
  }

  @Mutation(() => User)
  createUser(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<User> {
    return this.userService.create(name, email);
  }
}
