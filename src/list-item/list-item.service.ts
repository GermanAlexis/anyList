import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { PaginationArg } from '../common/dto/args/pagination.arg';
import { SearchArgs } from 'src/common/dto/args';
import { List } from 'src/list/entities/list.entity';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listitemrepository: Repository<ListItem>,
  ) {}
  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listitemrepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    return this.listitemrepository.save(newListItem);
  }

  async findAll(
    paginationArgs: PaginationArg,
    searchArg: SearchArgs,
    list: List,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArg;
    const queryBuilder = this.listitemrepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .skip(offset)
      .take(limit)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLocaleLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} listItem`;
  }

  update(id: number, updateListItemInput: UpdateListItemInput) {
    return `This action updates a #${id} listItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async getTotalitemsCount(list: List): Promise<number> {
    return this.listitemrepository.count({
      where: {
        list: {
          id: list.id,
        },
      },
    });
  }
}
