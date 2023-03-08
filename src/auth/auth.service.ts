import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInInput, SignUpInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(id: string): string {
    return this.jwtService.sign({ id });
  }
  async signUp(signupInput: SignUpInput): Promise<AuthResponse> {
    const userresponse = await this.userService.create(signupInput);
    const token = this.getJwtToken(userresponse.id);
    return {
      token,
      user: userresponse,
    };
  }

  async signIn(signinInput: SignInInput): Promise<AuthResponse> {
    const { email, password } = signinInput;
    const user = await this.userService.findOneByEmail(email);
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Password do not match');
    }
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user.isActive)
      throw new UnauthorizedException(`User is  inactive, talk with an admin`);

    delete user.password;
    return user;
  }
}
