import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { Chat } from '../models/chat.model';

@Injectable()
export class ChatService {
  private chats: Chat[] = [];
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectQueue('chat') private readonly defaultQueue: Queue,
  ) {}

  async addMessageToChatQueue(chatId: string, message: string, userId: string) {
    try {
      await this.defaultQueue.add('newMessage', { message, chatId, userId });
      
    } catch (error) {
      this.logger.error(
        `Failed to add message to chat queue: ${error.message}`,
        error.stack,
      );
    }
  }

  findAll(): Chat[] {
    return this.chats;
  }

  findByUser(userId: string): Chat[] {
    return this.chats.filter((chat) => chat.users.includes(userId));
  }

  create(userIds: string[]): Chat {
    const chat: Chat = { id: Date.now().toString(), users: userIds };
    this.chats.push(chat);
    return chat;
  }

  addUser(userId: string, chatId: string): Chat {
    const chat: Chat = this.chats.find((chat) => (chat.id = chatId));
    if (chat) {
      chat.users.push(userId);
      this.chats = this.chats.map((c) => {
        if (c.id === chatId) {
          return chat;
        }
        return c;
      });
      return chat;
    } else {
      return null;
    }
  }
}
