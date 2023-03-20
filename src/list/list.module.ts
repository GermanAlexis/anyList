import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListService } from './list.service';
import { ListResolver } from './list.resolver';
import { List } from './entities/list.entity';

@Module({
  providers: [ListResolver, ListService],
  imports: [TypeOrmModule.forFeature([List])],
  exports: [ListResolver, ListService],
})
export class ListModule {}
