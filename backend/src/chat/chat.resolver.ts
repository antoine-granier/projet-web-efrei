import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../models/chat.model';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guard';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService, private readonly userService: UserService) {}

  @Query(() => [Chat])
  // @UseGuards(GqlAuthGuard)
  getChats(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Query(() => [Chat])
  // @UseGuards(GqlAuthGuard)
  async getChatsByUser(@Args('userId') userId: string): Promise<Chat[]> {
    const user = await this.userService.findById(userId);
    if(!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return this.chatService.findByUser(userId);
  }

  @Mutation(() => Chat)
  // @UseGuards(GqlAuthGuard)
  async createChat(
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ): Promise<Chat> {
    await Promise.all(userIds.map(id => {
      return new Promise(async (resolve, reject) => {
        const user = await this.userService.findById(id);
        if(!user) reject("User not found");
        resolve(true);
      })
    }))
    return this.chatService.create(userIds);
  }

  @Mutation(() => Boolean)
  // @UseGuards(GqlAuthGuard)
  async addMessageToChat(
    @Args('chatId') chatId: string,
    @Args('message') message: string,
    @Args('author') author: string,
  ) {
    const chat = await this.chatService.findById(chatId);
    if(!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(author);
    if(!user) throw new HttpException('Author not found', HttpStatus.NOT_FOUND);

    await this.chatService.addMessageToChatQueue(chatId, message, author);
    return true;
  }

  @Mutation(() => Chat)
  // @UseGuards(GqlAuthGuard)
  async addUser(
    @Args('userId') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    const chat = await this.chatService.findById(chatId);
    if(!chat) throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(userId);
    if(!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    return this.chatService.addUser(userId, chatId);
  }
}
