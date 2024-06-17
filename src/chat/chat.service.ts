import { Injectable } from '@nestjs/common';
import { Chat } from 'src/models/chat.model';
import { User } from 'src/models/user.model';

@Injectable()
export class ChatService {
  private chats: Chat[] = [];

  findAll(): Chat[] {
    return this.chats;
  }

  findByUser(userId: string): Chat[] {
    return this.chats.filter(chat =>
      chat.users.some(chat => chat.id === userId),
    );
  }

  create(users: User[]): Chat {
    const chat = { id: Date.now().toString(), users };
    this.chats.push(chat);
    return chat;
  }
}
