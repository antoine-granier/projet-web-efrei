import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { Message } from '../models/message.model';

@Injectable()
export class MessageService {
  private messages: Message[] = [];

  constructor(private readonly chatService: ChatService) {}

  findAll(): Message[] {
    return this.messages;
  }

  findByChat(chatId: string): Message[] {
    return this.messages.filter((message) => message.chatId === chatId);
  }

  create(content: string, authorId: string, chatId: string): Message {
    const message = { id: Date.now().toString(), content, authorId, chatId };
    this.messages.push(message);
    this.chatService.addMessageToChatQueue(chatId, message.content, authorId);
    return message;
  }
}
