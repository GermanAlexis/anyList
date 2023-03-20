/* eslint-disable prettier/prettier */
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

import { ItemModule } from './item/item.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    // Simple implement
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   debug: false,
    //   playground: false,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   plugins: [ApolloServerPluginLandingPageLocalDefault],
    // }),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      useFactory: async (configureService: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context({ req }) {
          const token = req.headers.authorization?.replace('Bearer ', '');
          if (!token) throw Error('need a token');
          const payload = configureService.decode(token);
          if (!payload)
            throw new Error('calling the police -  not authorization');
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '(*/MYsECretPassword/*)',
      database: 'Anylist',
      synchronize: true,
      autoLoadEntities: true,
    }),
    ItemModule,
    UsersModule,
    AuthModule,
    SeedModule,
    CommonModule,
    ListModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
