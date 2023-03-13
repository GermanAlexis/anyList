import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse } from './types/auth-response.types';
import { SignInInput, SignUpInput } from './dto/inputs/index';
import { currentUser } from './decorator/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

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
  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(@currentUser([ValidRoles.superA]) user: User): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
