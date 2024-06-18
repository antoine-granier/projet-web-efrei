import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../models/chat.model';
import { InputUser } from '../models/user.model';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [Chat])
  getChats(): Chat[] {
    return this.chatService.findAll();
  }

  @Query(() => [Chat])
  getChatsByUser(@Args('userId') userId: string): Chat[] {
    return this.chatService.findByUser(userId);
  }

  @Mutation(() => Chat)
  createChat(
    @Args('users', { type: () => [InputUser] }) users: InputUser[],
  ): Chat {
    return this.chatService.create(users);
  }

  @Mutation((returns) => Boolean)
  async addMessageToChat(
    @Args('chatId') chatId: string,
    @Args('message') message: string,
  ) {
    await this.chatService.addMessageToChatQueue(chatId, message);
    return true;
  }

  @Mutation(() => Chat)
  addUser(
    @Args('user', { type: () => InputUser }) user: InputUser,
    @Args('chatId') chatId: string,
  ): Chat {
    return this.chatService.addUser(user, chatId);
  }
}
