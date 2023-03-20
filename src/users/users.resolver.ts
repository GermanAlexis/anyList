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

import { currentUser } from 'src/auth/decorator/current-user.decorator';

import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

import { UpdateUserInput } from './dto/input/index';

import { validRolesArgs } from './dto/args/roles.arg';
import { PaginationArg, SearchArgs } from './../common/dto/args/';

import { UsersService } from './users.service';
import { ItemService } from '../item/item.service';
import { ListService } from './../list/list.service';

import { User } from './entities/user.entity';
import { Item } from './../item/entities/item.entity';
import { List } from 'src/list/entities/list.entity';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemService: ItemService,
    private readonly listService: ListService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: validRolesArgs,
    @Args() pagination: PaginationArg,
    @Args() searchArgs: SearchArgs,
    @currentUser([ValidRoles.user]) user: User,
  ): Promise<User[]> {
    //* Is posible use props of user
    const propsuser = { roles: validRoles.roles, pagination, searchArgs, user };

    return this.usersService.findAll(propsuser);
  }

  @Query(() => User, { name: 'UserById' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    // @currentUser([ValidRoles.user, ValidRoles.admin]) user: User,
  ) {
    //* Is posible use props of user
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'BlockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @currentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @Mutation(() => User, { name: 'UpdateUser' })
  async updateUser(
    @Args('updateUserInput')
    updateUserInput: UpdateUserInput,
    @currentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput, user);
  }

  @ResolveField(() => Int, { name: 'itemsCount' })
  async itemsCount(
    @currentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemService.itemsCount(user);
  }
  @ResolveField(() => [Item], { name: 'itemsSearch' })
  async itemsSearch(
    @currentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
    @Args() pagination: PaginationArg,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemService.findAll(user, pagination, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listCount' })
  async ListCount(
    @currentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.listService.listCount(user);
  }
  @ResolveField(() => [List], { name: 'listsSearch' })
  async listsSearch(
    @currentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
    @Args() pagination: PaginationArg,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listService.findAll(pagination, searchArgs, user);
  }
}
