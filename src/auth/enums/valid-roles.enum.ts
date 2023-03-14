/* eslint-disable prettier/prettier */

import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superA = 'superAdmin',
}

registerEnumType(ValidRoles, {
  name: 'validRoles',
  description: 'Roles valid in system',
});
