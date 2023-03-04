import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/input';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });

    if (!item) throw new NotFoundException(`No se encontro elemento`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item)
      throw new NotFoundException(`No se encontro elemento a actualizar`);
    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    const item = await this.findOne(id);

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }
}
