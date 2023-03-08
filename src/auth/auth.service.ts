import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInInput, SignUpInput } from './dto/inputs';
import { AuthResponse } from './dto/types/auth-response.types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signUp(signupInput: SignUpInput): Promise<AuthResponse> {
    const userresponse = await this.userService.create(signupInput);
    const token = 'ABHC12365';
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
    const token = 'ABHC12365';
    return {
      token,
      user,
    };
  }
}
