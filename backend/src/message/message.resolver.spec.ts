import { Test, TestingModule } from '@nestjs/testing';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../user/user.service';
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('MessageResolver', () => {
  let resolver: MessageResolver;
  const mockMessageService = {
    findAll: jest.fn(),
    findByChat: jest.fn(),
    create: jest.fn(),
  };

  const mockChatService = {
    findById: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageResolver,
        { provide: MessageService, useValue: mockMessageService },
        { provide: ChatService, useValue: mockChatService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    resolver = module.get<MessageResolver>(MessageResolver);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return all messages', async () => {
      const messages = [
        { id: '1', content: 'Hello', authorId: '1', chatId: '1' },
      ];
      mockMessageService.findAll.mockResolvedValue(messages);

      const result = await resolver.getMessages();

      expect(result).toEqual(messages);
      expect(mockMessageService.findAll).toHaveBeenCalled();
    });
  });

  describe('getMessagesByChat', () => {
    it('should return messages for a specific chat', async () => {
      const messages = [
        { id: '1', content: 'Hello', authorId: '1', chatId: '1' },
      ];
      const chat = { id: '1', users: [], messages: [] };
      mockChatService.findById.mockResolvedValue(chat);
      mockMessageService.findByChat.mockResolvedValue(messages);

      const result = await resolver.getMessagesByChat('1');

      expect(result).toEqual(messages);
      expect(mockChatService.findById).toHaveBeenCalledWith('1');
      expect(mockMessageService.findByChat).toHaveBeenCalledWith('1');
    });

    it('should throw an error if chat is not found', async () => {
      mockChatService.findById.mockResolvedValue(null);

      await expect(resolver.getMessagesByChat('1')).rejects.toThrow(
        HttpException,
      );
      await expect(resolver.getMessagesByChat('1')).rejects.toThrow(
        'Chat not found',
      );
    });
  });
});
