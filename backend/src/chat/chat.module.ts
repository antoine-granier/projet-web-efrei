import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { BullModule } from '@nestjs/bull';
import { ChatProcessor } from './chat.processor';

@Module({
  providers: [ChatService, ChatResolver, ChatProcessor],
  imports: [
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  exports: [ChatService],
})
export class ChatModule {}
