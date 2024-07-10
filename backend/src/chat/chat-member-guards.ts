import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatMemberGuard implements CanActivate {
  constructor(
    private readonly chatService: ChatService,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const authorizationHeader = ctx.req.headers.authorization;

    const [type, token] = authorizationHeader.split(' ');

    const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });


    const chatId = ctx.req.body.variables.chatId || ctx.req.body.variables.chatId;

    if (!chatId) {
      throw new HttpException('Chat ID not provided', HttpStatus.BAD_REQUEST);
    }
    
    const chat = await this.chatService.findById(chatId);
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    const isUserInChat = chat.users.some(chatUser => chatUser.id === payload.sub);
    if (!isUserInChat) {
      throw new HttpException('User not in chat', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
