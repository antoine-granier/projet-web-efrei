import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bull';
import { ChatGateway } from 'src/chat/gateway/websockets.gateway';

@Processor('chat')
export class ChatProcessor {
  private readonly logger = new Logger(ChatProcessor.name);

  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  @Process('newMessage')
  async handleNewMessage(
    job: Job<{ message: string; userId: string; chatId: string }>,
  ) {
    const { message, userId, chatId } = job.data;
    console.log(`Processing message: ${message}`);
    try {
      const newMessage = await this.prisma.message.create({
        data: { content: message, authorId: userId, chatId },
      });
      this.chatGateway.sendMessageToChat(chatId, message, userId);
    } catch (error) {
      this.logger.error(
        `Failed to create message : ${error.message}`,
        error.stack,
      );
    }
  }
}
