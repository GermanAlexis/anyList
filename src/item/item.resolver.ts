import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { CreateItemInput, UpdateItemInput } from './dto/input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorator/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationArg } from '../common/dto/args/pagination.arg';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  @Mutation(() => Item, { name: 'createItem' })
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @currentUser() user: User,
  ) {
    return await this.itemService.create(createItemInput, user);
  }

  @Query(() => [Item], { name: 'items' })
  async findAll(
    @currentUser() user: User,
    @Args() pagination: PaginationArg,
  ): Promise<Item[]> {
    return this.itemService.findAll(user, pagination);
  }

  @Query(() => Item, { name: 'item' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ): Promise<Item> {
    return await this.itemService.findOne(id, user);
  }

  @Mutation(() => Item)
  async updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @currentUser() user: User,
  ): Promise<Item> {
    return await this.itemService.update(
      updateItemInput.id,
      updateItemInput,
      user,
    );
  }

  @Mutation(() => Item)
  async removeItem(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ): Promise<Item> {
    return this.itemService.remove(id, user);
  }
}
