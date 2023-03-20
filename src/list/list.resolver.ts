import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ListService } from './list.service';

import { CreateListInput, UpdateListInput } from './dto/input';

import { PaginationArg } from '../common/dto/args/pagination.arg';
import { SearchArgs } from '../common/dto/args/search.arg';
import { currentUser } from './../auth/decorator/current-user.decorator';

import { User } from './../users/entities/user.entity';
import { List } from './entities/list.entity';
import { validRolesArgs } from 'src/users/dto/args/roles.arg';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListResolver {
  constructor(
    private readonly listService: ListService,
    private readonly listItemService: ListItemService,
  ) {}

  @Mutation(() => List, { name: 'ListCreate' })
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @currentUser() user: User,
  ) {
    return this.listService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @Args() paginationArg: PaginationArg,
    @Args() searchArgs: SearchArgs,
    @currentUser() user: User,
  ): Promise<List[]> {
    return this.listService.findAll(paginationArg, searchArgs, user);
  }

  @Query(() => List, { name: 'listById' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return this.listService.findOne(id, user);
  }

  @Mutation(() => List)
  updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @currentUser() user: User,
  ) {
    return this.listService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  removeList(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @currentUser([ValidRoles.superA]) user: User,
  ) {
    return this.listService.remove(id, user);
  }

  @ResolveField(() => [ListItem], { name: 'items' })
  async getlistitems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArg,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemService.findAll(paginationArgs, searchArgs, list);
  }

  @ResolveField(() => Int, { name: 'TotalItemsCount' })
  async getTotalItemsCount(@Parent() list: List): Promise<number> {
    return this.listItemService.getTotalitemsCount(list);
  }
}
