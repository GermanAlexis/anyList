import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { SignUpInput } from 'src/auth/dto/inputs/singup-input';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UserServices');
  constructor(
    @InjectRepository(User)
    private readonly userReposistory: Repository<User>,
  ) {}

  async create(signupInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.userReposistory.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.userReposistory.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
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

  private handleDBErrors(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(error.detail.replace('key ', ''));

    this.logger.error(error);
    throw new InternalServerErrorException('Plase check server log');
  }
}
