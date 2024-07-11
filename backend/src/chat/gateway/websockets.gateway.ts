import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, Logger } from '@nestjs/common';
import { ChatService } from '../chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/models/user.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly authGuard = new AuthGuard(new JwtService({ secret: process.env.SECRET }));

  constructor(private chatService: ChatService) {}

  afterInit() {
    this.logger.log(`WebSocket Gateway Initialized`);
  }

  async handleConnection(client: Socket) {
    try {
      const context = this.createExecutionContext(client);
      const canActivate = await this.authGuard.canActivate(context);
      if (!canActivate) {
        throw new WsException('Unauthorized');
      }
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Client connection error: ${client.id}`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    client: Socket,
    { userId, chatId }: { userId: string; chatId: string },
  ): Promise<void> {
    try {
      const context = this.createExecutionContext(client);
      const canActivate = await this.authGuard.canActivate(context);
      if (!canActivate) {
        throw new WsException('Unauthorized');
      }
      
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
    } catch (error) {
      this.logger.error(`Authorization error: ${error.message}`);
      client.emit('error', 'Authorization error');
    }
  }

  sendMessageToChat(chatId: string, message: string, author: User): void {
    this.server.to(chatId).emit('message', { chatId, content: message, author });
  }

  private createExecutionContext(client: Socket): ExecutionContext {
    return {
      getType: () => 'ws',
      switchToWs: () => ({ getClient: () => client }),
    } as ExecutionContext;
  }
}
