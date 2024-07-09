import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from '../prisma/prisma.service';
import { ChatProcessor } from './chat.processor';
import { UserModule } from '../user/user.module';

@Module({
  providers: [ChatService, ChatResolver, PrismaService, ChatProcessor],
  imports: [
    BullModule.registerQueue({
      name: 'chat',
    }),
    UserModule,
  ],
  exports: [ChatService],
})
export class ChatModule {}
