import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from '../chat.service';
import { AuthGuard } from 'src/auth/auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
@UseGuards(AuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log(`WebSocket Gateway Initialized ${server.path()}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    client: Socket,
    { userId, chatId }: { userId: string; chatId: string },
  ): Promise<void> {
    if (chatId && userId) {
      const isUserInChat = await this.chatService.isUserInChat(userId, chatId);
      if (isUserInChat) {
        client.join(chatId);
        this.logger.log(`Client ${client.id} joined chat ${chatId}`);
      } else {
        client.emit('error', 'You are not a member of this chat');
        this.logger.warn(
          `User ${userId} attempted to join chat ${chatId} but is not a member`,
        );
      }
    }
  }

  sendMessageToChat(chatId: string, message: string, author: string): void {
    this.server.to(chatId).emit('message', { chatId, message, author });
  }
}
