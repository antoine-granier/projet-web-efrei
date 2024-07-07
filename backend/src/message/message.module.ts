import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [MessageService, MessageResolver, PrismaService],
  imports: [ChatModule],
})
export class MessageModule {}
