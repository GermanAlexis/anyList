import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput, UpdateListInput } from './dto/input';
import { PaginationArg } from '../common/dto/args/pagination.arg';
import { SearchArgs } from '../common/dto/args/search.arg';
import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    console.log('user: ', user);
    const newList = await this.listRepository.create({
      ...createListInput,
      user,
    });
    return this.listRepository.save(newList);
  }

  async findAll(
    paginationArgs: PaginationArg,
    searchArgs: SearchArgs,
    user: User,
  ): Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    const queryBuilder = this.listRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLocaleLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!list) throw new NotFoundException(`No se encontro elemento`);
    return list;
  }

  async update(
    id: string,
    updateListInput: UpdateListInput,
    user: User,
  ): Promise<List> {
    await this.findOne(id, user);
    const list = await this.listRepository.preload({
      ...updateListInput,
      user,
    });
    if (!list)
      throw new NotFoundException(`No se encontro elemento a actualizar`);
    return this.listRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const item = await this.findOne(id, user);

    await this.listRepository.remove(item);

    return { ...item, id };
  }

  async listCount(user: User): Promise<number> {
    return await this.listRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
