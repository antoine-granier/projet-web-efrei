import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../models/chat.model';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Chat])
  getChats(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Query(() => [Chat])
  async getChatsByUser(@Args('userId') userId: string): Promise<Chat[]> {
    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return this.chatService.findByUser(userId);
  }

  @Mutation(() => Chat)
  async createChat(
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ): Promise<Chat> {
    for (const id of userIds) {
      const user = await this.userService.findById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    }
    return this.chatService.create(userIds);
  }

  @Mutation(() => Boolean)
  async addMessageToChat(
    @Args('chatId') chatId: string,
    @Args('message') message: string,
    @Args('author') author: string,
  ) {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    if(!(chat.users.find((user)=>user.id == author))) throw new HttpException('Author not found in this chat', HttpStatus.NOT_FOUND);
    const user = await this.userService.findById(author);
    if (!user)
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);

    await this.chatService.addMessageToChatQueue(chatId, message, author);
    return true;
  }

  @Mutation(() => Chat)
  async addUser(
    @Args('userId') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.chatService.addUser(userId, chatId);
  }
}
