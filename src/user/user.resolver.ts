import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/models/user.model';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  getUsers(): User[] {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  createUser(@Args('name') name: string, @Args('email') email: string): User {
    return this.userService.create(name, email);
  }
}
