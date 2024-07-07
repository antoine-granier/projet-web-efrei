import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Queue } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { Chat } from '../models/chat.model';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectQueue('chat') private readonly defaultQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Store,
    private prisma: PrismaService,
  ) {}

  async addMessageToChatQueue(
    chatId: string,
    message: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.defaultQueue.add('newMessage', { message, chatId, userId });
    } catch (error) {
      this.logger.error(
        `Failed to add message to chat queue: ${error.message}`,
        error.stack,
      );
    }
  }

  async findAll(): Promise<Chat[]> {
    const cache = await this.cacheManager.get<Chat[]>('chats');
    if (cache) {
      return cache;
    }

    try {
      const chatsData = await this.prisma.chat.findMany({
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChats: Chat[] = chatsData.map((chat) => ({
        id: chat.id,
        users: chat.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chat.id,
            users: chat.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [], // Exclure les messages imbriqués pour éviter la référence circulaire
          },
        })),
      }));

      await this.cacheManager.set('chats', transformedChats);

      return transformedChats;
    } catch (error) {
      console.error('Error fetching all chats:', error);
      throw new Error('Could not fetch all chats');
    }
  }

  async findByUser(userId: string): Promise<Chat[]> {
    const cache = await this.cacheManager.get<Chat[]>(`chats-user-${userId}`);
    if (cache) {
      return cache;
    }

    try {
      const chatsData = await this.prisma.chat.findMany({
        where: {
          users: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChats: Chat[] = chatsData.map((chat) => ({
        id: chat.id,
        users: chat.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chat.id,
            users: chat.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [], // Exclure les messages imbriqués pour éviter la référence circulaire
          },
        })),
      }));

      await this.cacheManager.set(`chats-user-${userId}`, transformedChats);

      return transformedChats;
    } catch (error) {
      console.error('Error fetching chats for user:', error);
      throw new Error('Could not fetch chats for user');
    }
  }

  async create(userIds: string[]): Promise<Chat> {
    try {
      const chatData = await this.prisma.chat.create({
        data: {
          users: {
            create: userIds.map((id) => ({
              user: { connect: { id } },
            })),
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChat: Chat = {
        id: chatData.id,
        users: chatData.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chatData.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chatData.id,
            users: chatData.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [], // Exclude nested messages to avoid circular reference
          },
        })),
      };

      await this.cacheManager.set(
        `chats-${transformedChat.id}`,
        transformedChat,
      );

      const chatsData = await this.prisma.chat.findMany({
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChats = chatsData.map((chat) => ({
        id: chat.id,
        users: chat.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chat.id,
            users: chat.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [], // Exclude nested messages to avoid circular reference
          },
        })),
      }));

      await this.cacheManager.set('chats', transformedChats);

      return transformedChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error('Could not create chat');
    }
  }

  async addUser(userId: string, chatId: string): Promise<Chat> {
    try {
      const chatData = await this.prisma.chat.update({
        where: { id: chatId },
        data: {
          users: {
            create: { userId: userId },
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChat: Chat = {
        id: chatData.id,
        users: chatData.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chatData.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chatData.id,
            users: chatData.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      };

      await this.cacheManager.set(
        `chats-${transformedChat.id}`,
        transformedChat,
      );

      const chatsData = await this.prisma.chat.findMany({
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      const transformedChats = chatsData.map((chat) => ({
        id: chat.id,
        users: chat.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chat.id,
            users: chat.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      }));

      await this.cacheManager.set('chats', transformedChats);

      return transformedChat;
    } catch (error) {
      console.error('Error adding user to chat:', error);
      throw new Error('Could not add user to chat');
    }
  }
}
