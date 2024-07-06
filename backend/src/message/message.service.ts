import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Store } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '../models/message.model';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Store,
    private prisma: PrismaService,
    private readonly chatService: ChatService
  ) {}

  async findAll(): Promise<Message[]> {
    const cache = await this.cacheManager.get<Message[]>('messages');
    if (cache) {
      return cache;
    }
  
    try {
      const messagesData = await this.prisma.message.findMany({
        include: {
          author: true,
          chat: {
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
          },
        },
      });
  
      const transformedMessages: Message[] = messagesData.map(message => ({
        ...message,
        chat: {
          id: message.chat.id,
          users: message.chat.users.map(userChat => ({
            id: userChat.user.id,
            name: userChat.user.name,
            email: userChat.user.email,
          })),
          messages: message.chat.messages.map(chatMessage => ({
            id: chatMessage.id,
            content: chatMessage.content,
            authorId: chatMessage.authorId,
            chatId: chatMessage.chatId,
            author: {
              id: chatMessage.author.id,
              name: chatMessage.author.name,
              email: chatMessage.author.email,
            },
            chat: {
              id: message.chat.id,
              users: [],
              messages: [],
            },
          })),
        },
      }));
  
      await this.cacheManager.set('messages', transformedMessages);
      return transformedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new HttpException('Could not fetch messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByChat(chatId: string): Promise<Message[]> {
    const cache = await this.cacheManager.get<Message[]>(`messages-chat-${chatId}`);
    if (cache) {
      return cache;
    }
  
    try {
      const messagesData = await this.prisma.message.findMany({
        where: { chatId },
        include: {
          author: true,
          chat: {
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
          },
        },
      });
  
      const transformedMessages: Message[] = messagesData.map(message => ({
        ...message,
        chat: {
          id: message.chat.id,
          users: message.chat.users.map(userChat => ({
            id: userChat.user.id,
            name: userChat.user.name,
            email: userChat.user.email,
          })),
          messages: message.chat.messages.map(chatMessage => ({
            id: chatMessage.id,
            content: chatMessage.content,
            authorId: chatMessage.authorId,
            chatId: chatMessage.chatId,
            author: {
              id: chatMessage.author.id,
              name: chatMessage.author.name,
              email: chatMessage.author.email,
            },
            chat: {
              id: message.chat.id,
              users: [],
              messages: [],
            },
          })),
        },
      }));
  
      await this.cacheManager.set(`messages-chat-${chatId}`, transformedMessages);
      return transformedMessages;
    } catch (error) {
      console.error('Error fetching messages for chat:', error);
      throw new HttpException('Could not fetch messages for chat', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async create(content: string, authorId: string, chatId: string): Promise<Message> {
    try {
      const messageData = await this.prisma.message.create({
        data: { content, authorId, chatId },
        include: {
          author: true,
          chat: {
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
          },
        },
      });
  
      const transformedMessage: Message = {
        ...messageData,
        chat: {
          id: messageData.chat.id,
          users: messageData.chat.users.map(userChat => ({
            id: userChat.user.id,
            name: userChat.user.name,
            email: userChat.user.email,
          })),
          messages: messageData.chat.messages.map(chatMessage => ({
            id: chatMessage.id,
            content: chatMessage.content,
            authorId: chatMessage.authorId,
            chatId: chatMessage.chatId,
            author: {
              id: chatMessage.author.id,
              name: chatMessage.author.name,
              email: chatMessage.author.email,
            },
            chat: {
              id: messageData.chat.id,
              users: [],
              messages: [],
            },
          })),
        },
      };
  
      await this.cacheManager.set(`messages-${transformedMessage.id}`, transformedMessage);
  
      const messagesData = await this.prisma.message.findMany({
        where: { chatId },
        include: {
          author: true,
          chat: {
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
          },
        },
      });
  
      const transformedMessages: Message[] = messagesData.map(msg => ({
        ...msg,
        chat: {
          id: msg.chat.id,
          users: msg.chat.users.map(userChat => ({
            id: userChat.user.id,
            name: userChat.user.name,
            email: userChat.user.email,
          })),
          messages: msg.chat.messages.map(chatMessage => ({
            id: chatMessage.id,
            content: chatMessage.content,
            authorId: chatMessage.authorId,
            chatId: chatMessage.chatId,
            author: {
              id: chatMessage.author.id,
              name: chatMessage.author.name,
              email: chatMessage.author.email,
            },
            chat: {
              id: msg.chat.id,
              users: [],
              messages: [],
            },
          })),
        },
      }));
  
      await this.cacheManager.set(`messages-chat-${chatId}`, transformedMessages);
  
      this.chatService.addMessageToChatQueue(chatId, content, authorId);
      return transformedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw new HttpException('Could not create message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
