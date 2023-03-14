import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { SignUpInput } from 'src/auth/dto/inputs/signup-input';
import { UpdateUserInput } from './dto/input/index';

import { User } from './entities/user.entity';

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

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (!roles.length)
      return this.userReposistory.find({
        //* relationship not need why is props lazy in the entity
        // relations: {
        //   lastUpdateBy: true,
        // },
      });

    return this.userReposistory
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
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

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userReposistory.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`${id} not found `);
    }
  }

  async update(
    updateUserInput: UpdateUserInput,
    userUpdated: User,
  ): Promise<User> {
    try {
      const user = await this.userReposistory.preload(updateUserInput);
      user.lastUpdateBy = userUpdated;
      return await this.userReposistory.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, user: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = user;
    return this.userReposistory.save(userToBlock);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(error.detail.replace('key ', ''));

    this.logger.error(error);
    throw new InternalServerErrorException('Plase check server log');
  }
}
