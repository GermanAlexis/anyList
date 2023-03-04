import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsPositive, IsOptional, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @IsPositive()
  quantity: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  units?: string;
}
