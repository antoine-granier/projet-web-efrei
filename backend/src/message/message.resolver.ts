import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from '../models/message.model';
import { ChatService } from '../chat/chat.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Resolver()
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Message])
  getMessages(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Query(() => [Message])
  async getMessagesByChat(@Args('chatId') chatId: string): Promise<Message[]> {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    return this.messageService.findByChat(chatId);
  }
}
