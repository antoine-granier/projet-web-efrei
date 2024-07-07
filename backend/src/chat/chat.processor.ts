import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('chat')
export class ChatProcessor {
  @Process('newMessage')
  async handleNewMessage(job: Job<{ message: string }>) {    
    const { message } = job.data;
    console.log(`Processing message: ${message}`);
    // Process the message (e.g., save to database, notify users, etc.)
  }
}
