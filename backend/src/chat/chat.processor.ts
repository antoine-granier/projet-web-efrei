import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('chat')
export class ChatProcessor {
  private readonly logger = new Logger(ChatProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('newMessage')
  async handleNewMessage(
    job: Job<{ message: string; userId: string; chatId: string }>,
  ) {
    const { message, userId, chatId } = job.data;
    console.log(`Processing message: ${message}`);
    try {
      await this.prisma.message.create({
        data: { content: message, authorId: userId, chatId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create message : ${error.message}`,
        error.stack,
      );
    }
  }
}
