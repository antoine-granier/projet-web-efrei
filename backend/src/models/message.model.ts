import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { Chat } from './chat.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  authorId: string;

  @Field(() => Chat)
  chatId: string;
}
