/* eslint-disable prettier/prettier */
import { createParamDecorator } from '@nestjs/common/decorators';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';

export const currentUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user)
      throw new InternalServerErrorException(
        `no user inside the reques - make sure that we user the AuthGuards`,
      );

    if (!roles.length) return user;
    for (const role of roles) {
      if (user.roles.includes(role)) {
        return user;
      }
    }

    throw new ForbiddenException(
      `user ${user.fullName} need a valid role ${roles}`,
    );
  },
);
