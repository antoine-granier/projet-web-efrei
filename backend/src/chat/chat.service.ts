import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Queue } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Chat } from '../models/chat.model';
import { User } from 'src/models/user.model';

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
    user: User,
  ): Promise<void> {
    try {
      await this.defaultQueue.add('newMessage', { message, chatId, user });
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

  async findById(chatId: string): Promise<Chat> {
    const cache = await this.cacheManager.get<Chat>(`chats-${chatId}`);
    if (cache) {
      return cache;
    }

    try {
      const chatData = await this.prisma.chat.findUnique({
        where: {
          id: chatId,
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

      if (!chatData) return null;

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
            messages: [], // Exclure les messages imbriqués pour éviter la référence circulaire
          },
        })),
      };

      await this.cacheManager.set(`chats-${chatId}`, transformedChat);

      return transformedChat;
    } catch (error) {
      console.error('Error fetching chat for id:', error);
      return null;
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

  async isUserInChat(userId: string, chatId: string): Promise<boolean> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: true },
    });

    if (!chat) {
      return false;
    }
    return chat.users.some((user) => user.userId === userId);
  }

  async removeUser(userId: string, chatId: string): Promise<Chat> {
    try {
      // Trouver l'entrée dans la table de jointure UserChat à supprimer
      const userChatEntry = await this.prisma.userChat.findFirst({
        where: {
          userId: userId,
          chatId: chatId,
        },
      });
  
      if (!userChatEntry) {
        throw new Error(`User ${userId} is not part of Chat ${chatId}`);
      }
  
      // Supprimer l'entrée dans la table de jointure UserChat
      await this.prisma.userChat.delete({
        where: {
          userId_chatId: {
            chatId: userChatEntry.chatId,
            userId: userChatEntry.userId,
          }
        },
      });
  
      // Récupérer les données mises à jour du chat
      const updatedChat = await this.prisma.chat.findUnique({
        where: { id: chatId },
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
  
      if (!updatedChat) {
        throw new Error(`Chat ${chatId} not found after removing user`);
      }
  
      // Transformer les données du chat pour le retour
      const transformedChat: Chat = {
        id: updatedChat.id,
        users: updatedChat.users.map(userChat => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: updatedChat.messages.map(message => ({
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
            id: updatedChat.id,
            users: updatedChat.users.map(userChat => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      };
  
      // Mettre à jour le cache avec les données du chat
      await this.cacheManager.set(`chats-${transformedChat.id}`, transformedChat);
  
      // Récupérer et mettre à jour la liste des chats dans le cache
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
  
      const transformedChats = chatsData.map(chat => ({
        id: chat.id,
        users: chat.users.map(userChat => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map(message => ({
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
            users: chat.users.map(userChat => ({
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
      console.error('Error removing user from chat:', error);
      throw new Error('Could not remove user from chat');
    }
  }
}  
