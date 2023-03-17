import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/item/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemService } from 'src/item/item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    if (this.isProd)
      throw new UnauthorizedException('We cannot run SEED on prod');

    //? Delete data from DB
    await this.deleteRistersDataBase();

    //? Create Users
    const users = await this.loadUsers();

    await this.loadItems(users);

    return true;
  }

  async deleteRistersDataBase() {
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User[]> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users;
  }

  async loadItems(users: any) {
    const items = SEED_ITEMS;
    const itemsPerUser = Math.floor(SEED_ITEMS.length / users.length);
    for (let i = 0; i < users.length; i++) {
      const itemsPromise = [];
      const limit = i == users.length - 1 ? items.length : itemsPerUser;
      const itemsForCurrentUser = items.splice(0, limit);
      for (const item of itemsForCurrentUser) {
        itemsPromise.push(this.itemsService.create(item, users[i]));
      }
      await Promise.all(itemsPromise);
    }
  }
}
