import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatModule } from '../chat/chat.module';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [MessageService, MessageResolver, PrismaService],
  imports: [ChatModule, UserModule, AuthModule],
})
export class MessageModule {}
