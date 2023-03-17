/* eslint-disable prettier/prettier */
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

@ArgsType()
export class PaginationArg {
  @Field(() => Int, {
    nullable: true,
    description: 'Skip number of items next',
  })
  @IsOptional()
  @Min(0)
  offset = 0;

  @Field(() => Int, {
    nullable: true,
    description: 'quantity de items to back',
  })
  @IsOptional()
  @Min(1)
  limit = 6;
}
