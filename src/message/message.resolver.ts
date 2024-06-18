import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from 'src/models/message.model';
import { InputUser, User } from 'src/models/user.model';
import { Chat, InputChat } from 'src/models/chat.model';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query(() => [Message])
  getMessages(): Message[] {
    return this.messageService.findAll();
  }

  @Query(() => [Message])
  getMessagesByChat(@Args('chatId') chatId: string): Message[] {
    return this.messageService.findByChat(chatId);
  }

  @Mutation(() => Message)
  createMessage(
    @Args('content') content: string,
    @Args('author') author: InputUser,
    @Args('chat', { type: () => InputChat }) chat: InputChat,
  ): Message {
    return this.messageService.create(content, author, chat);
  }
}
