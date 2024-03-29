import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  // @Field(() => Float)
  // @IsPositive()
  // quantity: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  quantityUnits?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;
}
