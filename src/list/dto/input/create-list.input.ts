import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
