import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { ItemModule } from 'src/item/item.module';

@Module({
  imports: [ConfigModule, UsersModule, ItemModule],
  providers: [SeedResolver, SeedService],
})
export class SeedModule {}
