import { Injectable } from '@nestjs/common';
import { SignUpInput } from 'src/auth/dto/inputs/singup-input';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userReposistory: Repository<User>,
  ) {}

  async create(signupInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.userReposistory.create(signupInput);
      return await this.userReposistory.save(newUser);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  // async findOne(id: string): Promise<User> {
  //   return;
  // }

  // async block(id: string): Promise<User> {
  //   return;
  // }
}
