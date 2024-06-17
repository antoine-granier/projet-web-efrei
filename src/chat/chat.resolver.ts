import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from 'src/models/chat.model';
import { InputUser, User } from 'src/models/user.model';

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
  createChat(@Args('users', {type: () => [InputUser]}) users: InputUser[]): Chat {
    return this.chatService.create(users);
  }
}
