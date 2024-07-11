import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bull';
import { ChatGateway } from 'src/chat/gateway/websockets.gateway';
import { User } from 'src/models/user.model';

@Processor('chat')
export class ChatProcessor {
  private readonly logger = new Logger(ChatProcessor.name);

  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  @Process('newMessage')
  async handleNewMessage(
    job: Job<{ message: string; user: User; chatId: string }>,
  ) {
    const { message, user, chatId } = job.data;
    this.logger.log(`Processing message: ${message}`);
    try {
      await this.prisma.message.create({
        data: { content: message, authorId: user.id, chatId },
      });
      this.chatGateway.sendMessageToChat(chatId, message, user);
    } catch (error) {
      this.logger.error(
        `Failed to create message : ${error.message}`,
        error.stack,
      );
    }
  }
}
