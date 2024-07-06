import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ChatService, ChatResolver, PrismaService],
  imports: [
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  exports: [ChatService],
})
export class ChatModule {}
