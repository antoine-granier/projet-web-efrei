import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from '../models/message.model';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query(() => [Message])
  getMessages(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Query(() => [Message])
  getMessagesByChat(@Args('chatId') chatId: string): Promise<Message[]> {
    return this.messageService.findByChat(chatId);
  }

  @Mutation(() => Message)
  createMessage(
    @Args('content') content: string,
    @Args('author') author: string,
    @Args('chat') chat: string,
  ): Promise<Message> {
    return this.messageService.create(content, author, chat);
  }
}
