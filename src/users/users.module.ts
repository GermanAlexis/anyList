import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from '../item/item.module';
import { ListModule } from 'src/list/list.module';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [TypeOrmModule.forFeature([User]), ItemModule, ListModule],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
