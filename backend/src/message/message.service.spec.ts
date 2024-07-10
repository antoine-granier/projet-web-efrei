import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { HttpException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockChatService = {
    addMessageToChatQueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return cached messages if available', async () => {
      const cachedMessages = [
        { id: '1', content: 'Hello', authorId: '1', chatId: '1' },
      ];
      mockCacheManager.get.mockResolvedValue(cachedMessages);

      const result = await service.findAll();

      expect(result).toEqual(cachedMessages);
      expect(mockCacheManager.get).toHaveBeenCalledWith('messages');
      expect(prismaService.message.findMany).not.toHaveBeenCalled();
    });

    it('should fetch messages from database if cache is empty', async () => {
      const messagesData = [
        {
          id: '1',
          content: 'Hello',
          authorId: '1',
          chatId: '1',
          author: { id: '1', name: 'Author', email: 'author@example.com' },
          chat: {
            id: '1',
            users: [
              { user: { id: '1', name: 'User', email: 'user@example.com' } },
            ],
            messages: [
              {
                id: '1',
                content: 'Hello',
                authorId: '1',
                chatId: '1',
                author: {
                  id: '1',
                  name: 'Author',
                  email: 'author@example.com',
                },
              },
            ],
          },
        },
      ];
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.message.findMany.mockResolvedValue(messagesData);

      const result = await service.findAll();

      expect(result).toEqual(expect.any(Array));
      expect(mockCacheManager.get).toHaveBeenCalledWith('messages');
      expect(prismaService.message.findMany).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'messages',
        expect.any(Array),
      );
    });

    it('should throw an error if database query fails', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.message.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow(HttpException);
      await expect(service.findAll()).rejects.toThrow(
        'Could not fetch messages',
      );
    });
  });

  describe('findByChat', () => {
    it('should return cached messages if available', async () => {
      const cachedMessages = [
        { id: '1', content: 'Hello', authorId: '1', chatId: '1' },
      ];
      mockCacheManager.get.mockResolvedValue(cachedMessages);

      const result = await service.findByChat('1');

      expect(result).toEqual(cachedMessages);
      expect(mockCacheManager.get).toHaveBeenCalledWith('messages-chat-1');
      expect(prismaService.message.findMany).not.toHaveBeenCalled();
    });

    it('should fetch messages from database if cache is empty', async () => {
      const messagesData = [
        {
          id: '1',
          content: 'Hello',
          authorId: '1',
          chatId: '1',
          author: { id: '1', name: 'Author', email: 'author@example.com' },
          chat: {
            id: '1',
            users: [
              { user: { id: '1', name: 'User', email: 'user@example.com' } },
            ],
            messages: [
              {
                id: '1',
                content: 'Hello',
                authorId: '1',
                chatId: '1',
                author: {
                  id: '1',
                  name: 'Author',
                  email: 'author@example.com',
                },
              },
            ],
          },
        },
      ];
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.message.findMany.mockResolvedValue(messagesData);

      const result = await service.findByChat('1');

      expect(result).toEqual(expect.any(Array));
      expect(mockCacheManager.get).toHaveBeenCalledWith('messages-chat-1');
      expect(prismaService.message.findMany).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'messages-chat-1',
        expect.any(Array),
      );
    });

    it('should throw an error if database query fails', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.message.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findByChat('1')).rejects.toThrow(HttpException);
      await expect(service.findByChat('1')).rejects.toThrow(
        'Could not fetch messages for chat',
      );
    });
  });

  describe('create', () => {
    it('should create a new message and update cache', async () => {
      const messageData = {
        id: '1',
        content: 'Hello',
        authorId: '1',
        chatId: '1',
        author: { id: '1', name: 'Author', email: 'author@example.com' },
        chat: {
          id: '1',
          users: [
            { user: { id: '1', name: 'User', email: 'user@example.com' } },
          ],
          messages: [
            {
              id: '1',
              content: 'Hello',
              authorId: '1',
              chatId: '1',
              author: { id: '1', name: 'Author', email: 'author@example.com' },
            },
          ],
        },
      };
      const messagesData = [messageData];
      mockPrismaService.message.create.mockResolvedValue(messageData);
      mockPrismaService.message.findMany.mockResolvedValue(messagesData);

      const result = await service.create('Hello', '1', '1');

      expect(result).toEqual(expect.any(Object));
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: { content: 'Hello', authorId: '1', chatId: '1' },
        include: expect.any(Object),
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `messages-${messageData.id}`,
        expect.any(Object),
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'messages-chat-1',
        expect.any(Array),
      );
      expect(mockChatService.addMessageToChatQueue).toHaveBeenCalledWith(
        '1',
        'Hello',
        '1',
      );
    });

    it('should throw an error if message creation fails', async () => {
      mockPrismaService.message.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create('Hello', '1', '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.create('Hello', '1', '1')).rejects.toThrow(
        'Could not create message',
      );
    });
  });
});
