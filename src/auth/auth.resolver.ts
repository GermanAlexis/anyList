import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput } from './dto/inputs/index';
import { AuthResponse } from './types/auth-response.types';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Mutation(() => AuthResponse, { name: 'signup' })
  async signUp(
    @Args('signupInput') signupInput: SignUpInput,
  ): Promise<AuthResponse> {
    return await this.authService.signUp(signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async signIn(
    @Args('signinInput') signinInput: SignInInput,
  ): Promise<AuthResponse> {
    return await this.authService.signIn(signinInput);
  }
  // @Mutation(() => Auth)
  // removeAuth(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.remove(id);
  // }
}
