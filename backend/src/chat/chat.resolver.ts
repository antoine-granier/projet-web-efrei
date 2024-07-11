import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../models/chat.model';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ChatMemberGuard } from './chat-member-guards';
import { AuthGuard } from '../auth/auth.guard';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Chat])
  @UseGuards(AuthGuard)
  getChats(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Query(() => [Chat])
  @UseGuards(AuthGuard)
  async getChatsByUser(@Args('userId') userId: string): Promise<Chat[]> {
    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return this.chatService.findByUser(userId);
  }

  @Query(() => Chat)
  @UseGuards(AuthGuard, ChatMemberGuard)
  async getChatById(@Args('chatId') chatId: string): Promise<Chat> {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    return chat;
  }

  @Mutation(() => Chat)
  @UseGuards(AuthGuard)
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
  // @UseGuards(AuthGuard, ChatMemberGuard)
  async addMessageToChat(
    @Args('chatId') chatId: string,
    @Args('message') message: string,
    @Args('author') author: string,
  ) {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    if (!chat.users.find((user) => user.id == author))
      throw new HttpException(
        'Author not found in this chat',
        HttpStatus.NOT_FOUND,
      );
    const user = await this.userService.findById(author);
    if (!user)
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);

    await this.chatService.addMessageToChatQueue(chatId, message, user);
    return true;
  }

  @Mutation(() => Chat)
  @UseGuards(ChatMemberGuard)
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

  @Mutation(() => Chat)
  @UseGuards(ChatMemberGuard)
  async removeUser(
    @Args('userId') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    const chat = await this.chatService.findById(chatId);
    if (!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.chatService.removeUser(userId, chatId);
  }
}
