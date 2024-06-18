import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { Chat } from 'src/models/chat.model';
import { Message } from 'src/models/message.model';
import { User } from 'src/models/user.model';

@Injectable()
export class MessageService {
  private messages: Message[] = [];

  constructor(private readonly chatService: ChatService) {}

  findAll(): Message[] {
    return this.messages;
  }

  findByChat(chatId: string): Message[] {
    return this.messages.filter((message) => message.chat.id === chatId);
  }

  create(content: string, author: User, chat: Chat): Message {
    const message = { id: Date.now().toString(), content, author, chat };
    this.messages.push(message);
    this.chatService.addMessageToChatQueue(chat.id, message.content);
    return message;
  }
}
