import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../models/chat.model';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [Chat])
  getChats(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Query(() => [Chat])
  getChatsByUser(@Args('userId') userId: string): Promise<Chat[]> {
    return this.chatService.findByUser(userId);
  }

  @Mutation(() => Chat)
  createChat(
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ): Promise<Chat> {
    return this.chatService.create(userIds);
  }

  @Mutation(() => Boolean)
  async addMessageToChat(
    @Args('chatId') chatId: string,
    @Args('message') message: string,
    @Args('author') author: string,
  ) {
    await this.chatService.addMessageToChatQueue(chatId, message, author);
    return true;
  }

  @Mutation(() => Chat)
  addUser(
    @Args('userId') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    return this.chatService.addUser(userId, chatId);
  }
}
