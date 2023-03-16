import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/input';
import { Item } from './entities/item.entity';

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

  async findAll(user: User): Promise<Item[]> {
    return this.itemsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
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
