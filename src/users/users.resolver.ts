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
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { validRolesArgs } from './dto/args/roles.arg';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorator/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/input/index';
import { ItemService } from '../item/item.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemService: ItemService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: validRolesArgs,
    @currentUser([ValidRoles.user]) user: User,
  ): Promise<User[]> {
    //* Is posible use props of user
    return this.usersService.findAll(validRoles.roles);
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
}
