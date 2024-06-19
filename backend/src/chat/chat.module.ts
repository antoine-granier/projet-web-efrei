import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { BullModule } from '@nestjs/bull';

@Module({
  providers: [ChatService, ChatResolver],
  imports: [
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  exports: [ChatService],
})
export class ChatModule {}
