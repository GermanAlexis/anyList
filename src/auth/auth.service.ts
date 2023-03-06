import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpInput } from './dto/inputs/singup-input';
import { AuthResponse } from './dto/types/auth-response.types';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signup(signupInput: SignUpInput): Promise<AuthResponse> {
    const userresponse = await this.userService.create(signupInput);
    const token = 'ABHC12365';
    return {
      token,
      user: userresponse,
    };
  }
}
