import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { SignUpInput } from 'src/auth/dto/inputs/signup-input';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

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

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userReposistory.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`${email} not found `);
      // this.handleDBErrors({
      //   code: 'error-01',
      //   details: `${email} not found`,
      // });
    }
  }

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
