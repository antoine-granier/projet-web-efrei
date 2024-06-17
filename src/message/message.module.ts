import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [MessageService, MessageResolver],
  imports:[ChatModule]
})
export class MessageModule {}
