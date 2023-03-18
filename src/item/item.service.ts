import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationArg } from 'src/common/dto/args/pagination.arg';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/input';
import { Item } from './entities/item.entity';
import { SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    return this.itemsRepository.save(newItem);
  }

  async findAll(
    user: User,
    pagination: PaginationArg,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = pagination;
    const { search } = searchArgs;
    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .skip(offset)
      .take(limit)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLocaleLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();

    //? Sugerency
    // return this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search?.toLocaleLowerCase()}%`),
    //   },
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!item) throw new NotFoundException(`No se encontro elemento`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item)
      throw new NotFoundException(`No se encontro elemento a actualizar`);
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user): Promise<Item> {
    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  async itemsCount(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
