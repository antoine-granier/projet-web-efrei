import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
// @Dependencies(UserService)
export class AuthService {
  private saltOrRounds: number = 10;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    const isMatch = await bcrypt.compare(pass, user?.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    return {
      ...user,
      token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET,
      }),
    };
  }

  async signUp(name: string, email: string, password: string) {
    const hashPass = await bcrypt.hash(password, this.saltOrRounds);
    const user = await this.userService.create(name, email, hashPass);

    if (!user)
      return {
        success: false,
        message: 'Error during account creation.',
      };
    return {
      success: true,
      message: 'Account created.',
    };
  }
}
