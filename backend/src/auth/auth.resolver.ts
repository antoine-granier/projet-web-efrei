import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { isValidEmail } from '../utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SignInReturn, SignUpReturn } from '../models/auth.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignInReturn)
  signIn(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<SignInReturn> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    return this.authService.signIn(email, password);
  }

  @Mutation(() => SignUpReturn)
  async signUp(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<SignUpReturn> {
    if (!isValidEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const data = await this.authService.signUp(name, email, password);

    return {
      success: data.success,
      message: data.message,
    };
  }
}
