import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bull';
import { Store } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from 'src/models/user.model';
import { Chat } from 'src/models/chat.model';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;
  let cacheManager: Store;
  let queue: Queue;

  const mockPrismaService = {
    chat: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userChat: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: 'BullQueue_chat', useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Store>(CACHE_MANAGER);
    queue = module.get<Queue>('BullQueue_chat');

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // describe('addMessageToChatQueue', () => {
  //   it('should add a message to the chat queue', async () => {
  //     const user: User = { id: '1', name: 'User', email: 'user@example.com' };
  //     await service.addMessageToChatQueue('1', 'Hello, world!', user);

  //     expect(queue.add).toHaveBeenCalledWith('newMessage', {
  //       chatId: '1',
  //       message: 'Hello, world!',
  //       user,
  //     });
  //   });

  //   it('should log an error if adding to the queue fails', async () => {
  //     const error = new Error('Queue error');
  //     jest.spyOn(queue, 'add').mockRejectedValueOnce(error);
  //     const user: User = { id: '1', name: 'User', email: 'user@example.com' };
  
  //     await service.addMessageToChatQueue('1', 'Hello, world!', user);
  
  //     expect(queue.add).toHaveBeenCalledWith('newMessage', {
  //       chatId: '1',
  //       message: 'Hello, world!',
  //       user,
  //     });
  //     expect(console.error).toHaveBeenCalledWith(
  //       `Failed to add message to chat queue: ${error.message}`,
  //       error.stack,
  //     );
  //   });
  // });

  describe('findAll', () => {
    it('should return all chats from cache if available', async () => {
      const cachedChats: Chat[] = [{ id: '1', users: [], messages: [] }];
      mockCacheManager.get.mockResolvedValueOnce(cachedChats);

      const result = await service.findAll();

      expect(result).toEqual(cachedChats);
      expect(prisma.chat.findMany).not.toHaveBeenCalled();
    });

    it('should fetch all chats from the database if not cached', async () => {
      const chatsData = [{ id: '1', users: [], messages: [] }];
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findMany.mockResolvedValueOnce(chatsData);

      const result = await service.findAll();

      expect(result).toEqual(chatsData);
      expect(prisma.chat.findMany).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith('chats', chatsData);
    });

    it('should throw an error if database query fails', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findMany.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.findAll()).rejects.toThrow('Could not fetch all chats');
    });
  });

  describe('findById', () => {
    it('should return a chat from cache if available', async () => {
      const cachedChat: Chat = { id: '1', users: [], messages: [] };
      mockCacheManager.get.mockResolvedValueOnce(cachedChat);

      const result = await service.findById('1');

      expect(result).toEqual(cachedChat);
      expect(prisma.chat.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch a chat from the database if not cached', async () => {
      const chatData = { id: '1', users: [], messages: [] };
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findUnique.mockResolvedValueOnce(chatData);

      const result = await service.findById('1');

      expect(result).toEqual(chatData);
      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { users: { include: { user: true } }, messages: { include: { author: true } } },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith('chats-1', chatData);
    });

    it('should return null if chat is not found', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findUnique.mockResolvedValueOnce(null);

      const result = await service.findById('1');

      expect(result).toBeNull();
    });

    it('should throw an error if database query fails', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findUnique.mockRejectedValueOnce(new Error('DB error'));
  
      await expect(service.findById('1')).rejects.toThrow('Could not fetch chat for id');
    });
  });

  describe('findByUser', () => {
    it('should return chats for a user from cache if available', async () => {
      const cachedChats: Chat[] = [{ id: '1', users: [], messages: [] }];
      mockCacheManager.get.mockResolvedValueOnce(cachedChats);

      const result = await service.findByUser('1');

      expect(result).toEqual(cachedChats);
      expect(prisma.chat.findMany).not.toHaveBeenCalled();
    });

    it('should fetch chats for a user from the database if not cached', async () => {
      const chatsData = [{ id: '1', users: [], messages: [] }];
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findMany.mockResolvedValueOnce(chatsData);

      const result = await service.findByUser('1');

      expect(result).toEqual(chatsData);
      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: { users: { some: { userId: '1' } } },
        include: { users: { include: { user: true } }, messages: { include: { author: true } } },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith('chats-user-1', chatsData);
    });

    it('should throw an error if database query fails', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockPrismaService.chat.findMany.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.findByUser('1')).rejects.toThrow('Could not fetch chats for user');
    });
  });

  describe('create', () => {
    it('should create a chat and cache it', async () => {
      const userIds = ['user1', 'user2'];
      const mockChatData = {
        id: 'chat1',
        users: [
          { user: { id: 'user1', name: 'User One', email: 'user1@example.com' } },
          { user: { id: 'user2', name: 'User Two', email: 'user2@example.com' } },
        ],
        messages: [
          {
            id: 'message1',
            content: 'Hello',
            authorId: 'user1',
            chatId: 'chat1',
            author: { id: 'user1', name: 'User One', email: 'user1@example.com' },
          },
        ],
      };
      const mockChatsData = [mockChatData];

      mockPrismaService.chat.create.mockResolvedValue(mockChatData);
      mockPrismaService.chat.findMany.mockResolvedValue(mockChatsData);
      mockCacheManager.set.mockResolvedValue(true);

      const result = await service.create(userIds);

      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
          users: {
            create: userIds.map((id) => ({
              user: { connect: { id } },
            })),
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      expect(cacheManager.set).toHaveBeenCalledWith(`chats-${mockChatData.id}`, {
        id: mockChatData.id,
        users: mockChatData.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: mockChatData.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: mockChatData.id,
            users: mockChatData.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      });

      expect(cacheManager.set).toHaveBeenCalledWith('chats', mockChatsData.map((chat) => ({
        id: chat.id,
        users: chat.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: chat.id,
            users: chat.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      })));

      expect(result).toEqual({
        id: mockChatData.id,
        users: mockChatData.users.map((userChat) => ({
          id: userChat.user.id,
          name: userChat.user.name,
          email: userChat.user.email,
        })),
        messages: mockChatData.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          chatId: message.chatId,
          author: {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email,
          },
          chat: {
            id: mockChatData.id,
            users: mockChatData.users.map((userChat) => ({
              id: userChat.user.id,
              name: userChat.user.name,
              email: userChat.user.email,
            })),
            messages: [],
          },
        })),
      });
    });

    it('should throw an error if chat creation fails', async () => {
      const userIds = ['user1', 'user2'];
      mockPrismaService.chat.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.create(userIds)).rejects.toThrow('Could not create chat');

      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
          users: {
            create: userIds.map((id) => ({
              user: { connect: { id } },
            })),
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              author: true,
            },
          },
        },
      });

      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('addUser', () => {
    it('should add a user to a chat', async () => {
      const chatData = { id: '1', users: [], messages: [] };
      mockPrismaService.chat.update.mockResolvedValueOnce(chatData);

      const result = await service.addUser('1', '1');

      expect(result).toEqual(chatData);
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { users: { create: { userId: '1' } } },
        include: { users: { include: { user: true } }, messages: { include: { author: true } } },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith('chats-1', chatData);
    });

    it('should throw an error if database query fails', async () => {
      mockPrismaService.chat.update.mockRejectedValueOnce(new Error('DB error'));
  
      await expect(service.addUser('1', '1')).rejects.toThrow('Could not add user to chat');
    });
  });

  describe('removeUser', () => {
    it('should remove a user from a chat', async () => {
        const userChatEntry = { userId: '1', chatId: '1' };
        const chatData = {
            id: '1',
            users: [{
                id: '1',
                name: 'User',
                email: 'user@example.com',
            }],
            messages: [],
        };

        mockPrismaService.userChat.findFirst.mockResolvedValueOnce(userChatEntry);
        mockPrismaService.userChat.delete.mockResolvedValueOnce(undefined);
        mockPrismaService.chat.findUnique.mockResolvedValueOnce({
            ...chatData,
            users: chatData.users.map(user => ({ user })),
        });

        const result = await service.removeUser('1', '1');

        expect(result).toEqual(chatData);
        expect(prisma.userChat.findFirst).toHaveBeenCalledWith({
            where: { userId: '1', chatId: '1' },
        });
        expect(prisma.userChat.delete).toHaveBeenCalledWith({
            where: { userId_chatId: { userId: '1', chatId: '1' } },
        });
        expect(prisma.chat.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
            include: { users: { include: { user: true } }, messages: { include: { author: true } } },
        });
        expect(mockCacheManager.set).toHaveBeenCalledWith('chats-1', chatData);
    });

    it('should throw an error if user is not part of the chat', async () => {
        mockPrismaService.userChat.findFirst.mockResolvedValueOnce(null);

        await expect(service.removeUser('1', '1')).rejects.toThrow('Could not remove user from chat');
    });

    it('should throw an error if database query fails', async () => {
        mockPrismaService.userChat.findFirst.mockRejectedValueOnce(new Error('Could not remove user from chat'));

        await expect(service.removeUser('1', '1')).rejects.toThrow('Could not remove user from chat');
    });
  });

  describe('isUserInChat', () => {
    it('should return true if user is in the chat', async () => {
      const chatData = { id: '1', users: [{ userId: '1' }] };
      mockPrismaService.chat.findUnique.mockResolvedValueOnce(chatData);

      const result = await service.isUserInChat('1', '1');

      expect(result).toBe(true);
      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { users: true },
      });
    });

    it('should return false if user is not in the chat', async () => {
      const chatData = { id: '1', users: [] };
      mockPrismaService.chat.findUnique.mockResolvedValueOnce(chatData);

      const result = await service.isUserInChat('1', '1');

      expect(result).toBe(false);
    });

    it('should return false if chat is not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValueOnce(null);

      const result = await service.isUserInChat('1', '1');

      expect(result).toBe(false);
    });
  });
});
