/* eslint-disable prettier/prettier */
import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
@ArgsType()
export class SearchArgs {
  @Field(() => String, {
    nullable: true,
    description: 'parameter for really search',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
