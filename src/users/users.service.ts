import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { SignUpInput } from 'src/auth/dto/inputs/signup-input';
import { UpdateUserInput } from './dto/input/index';

import { User } from './entities/user.entity';
import { SearchArgs } from '../common/dto/args/search.arg';

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

  async findAll(props: any): Promise<User[]> {
    const { pagination, roles, searchArgs } = props;
    const { search } = searchArgs;

    if (!roles.length) {
      return this.userReposistory.find({
        // * relationship not need why is props lazy in the entity
        // relations: {
        //   lastUpdateBy: true,
        // },
        take: pagination?.limit,
        skip: pagination?.offset,

        where: {
          fullName: Like(`%${search?.toLocaleLowerCase()}%`),
        },
      });
    }

    const queryBuilder = this.userReposistory
      .createQueryBuilder()
      .skip(pagination?.offset)
      .take(pagination?.limit)
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles);

    if (search) {
      queryBuilder.andWhere('LOWER(fullName) like :fullName', {
        fullName: `%${search.toLocaleLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
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
