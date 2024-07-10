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

  @Mutation(() => Message)
  async createMessage(
    @Args('content') content: string,
    @Args('author') author: string,
    @Args('chat') chat: string,
  ): Promise<Message> {
    const chatData = await this.chatService.findById(chat);
    if (!chatData)
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(author);
    if (!user)
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);

    return this.messageService.create(content, author, chat);
  }
}
