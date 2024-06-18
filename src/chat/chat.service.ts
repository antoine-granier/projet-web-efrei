import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import * as Bull from 'bull';
import { Chat } from '../models/chat.model';
import { User } from '../models/user.model';
import { ChatProcessor } from './chat.processor';

@Injectable()
export class ChatService {
  private chats: Chat[] = [];
  private chatQueues: Map<string, Bull.Queue> = new Map<string, Bull.Queue>();
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectQueue('chat') private readonly defaultQueue: Queue,
    private readonly chatProcessor: ChatProcessor,
  ) {}

  async createChatQueue(chatId: string): Promise<Bull.Queue> {
    console.log('createChatQueue');
    
    if (!this.chatQueues.has(chatId)) {
      const chatQueue = new Bull(`chat-${chatId}`);

      console.log(chatQueue);
      
      
      chatQueue.process('newMessage', async (job: any) => {
      console.log('newMessage');

        await this.chatProcessor.handleNewMessage(job);
        });
        
        
      console.log('after newMessage');

      chatQueue.on('completed', (job) => {
        console.log(`Job ${job.id} has been completed`);
      });

      chatQueue.on('failed', (job, err) => {
        console.error(`Job ${job.id} has failed with ${err.message}`);
      });
      this.chatQueues.set(chatId, chatQueue);
    }
    return this.chatQueues.get(chatId);
  }

  async addMessageToChatQueue(chatId: string, message: string) {
    try {
      const queue = this.chatQueues.get(chatId);
      await queue.add('newMessage', { message });
    } catch (error) {
      this.logger.error(
        `Failed to add message to chat queue: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to add message to chat queue');
    }
  }

  findAll(): Chat[] {
    return this.chats;
  }

  findByUser(userId: string): Chat[] {
    return this.chats.filter((chat) =>
      chat.users.some((user) => user.id === userId),
    );
  }

  create(users: User[]): Chat {
    const chat: Chat = { id: Date.now().toString(), users };
    this.createChatQueue(chat.id).catch((error) => {
      this.logger.error(
        `Failed to create chat queue: ${error.message}`,
        error.stack,
      );
    });
    this.chats.push(chat);
    return chat;
  }

  addUser(user: User, chatId: string): Chat {
    const chat: Chat = this.chats.find((chat) => (chat.id = chatId));
    if (chat) {
      chat.users.push(user);
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
