import { Test, TestingModule } from '@nestjs/testing';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Chat } from '../models/chat.model';

describe('ChatResolver', () => {
  let resolver: ChatResolver;
  let chatService: ChatService;
  let userService: UserService;

  const mockChatService = {
    findAll: jest.fn(),
    findByUser: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    addMessageToChatQueue: jest.fn(),
    addUser: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatResolver,
        { provide: ChatService, useValue: mockChatService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<ChatResolver>(ChatResolver);
    chatService = module.get<ChatService>(ChatService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getChats', () => {
    it('should return all chats', async () => {
      const chats = [{ id: '1', users: [], messages: [] }];
      mockChatService.findAll.mockResolvedValue(chats);

      const result = await resolver.getChats();

      expect(result).toEqual(chats);
      expect(mockChatService.findAll).toHaveBeenCalled();
    });
  });

  describe('getChatsByUser', () => {
    it('should return chats for a specific user', async () => {
      const chats = [{ id: '1', users: [], messages: [] }];
      const user = { id: '1', name: 'User', email: 'user@example.com' };
      mockUserService.findById.mockResolvedValue(user);
      mockChatService.findByUser.mockResolvedValue(chats);

      const result = await resolver.getChatsByUser('1');

      expect(result).toEqual(chats);
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(mockChatService.findByUser).toHaveBeenCalledWith('1');
    });

    it('should throw an error if user is not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(resolver.getChatsByUser('1')).rejects.toThrow(HttpException);
      await expect(resolver.getChatsByUser('1')).rejects.toThrow('User not found');
    });
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      const chat = { id: '1', users: [], messages: [] };
      const user = { id: '1', name: 'User', email: 'user@example.com' };
      mockUserService.findById.mockResolvedValue(user);
      mockChatService.create.mockResolvedValue(chat);

      const result = await resolver.createChat(['1']);

      expect(result).toEqual(chat);
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(mockChatService.create).toHaveBeenCalledWith(['1']);
    });

    it('should throw an error if any user is not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(resolver.createChat(['1'])).rejects.toThrow(HttpException);
      await expect(resolver.createChat(['1'])).rejects.toThrow('User not found');
    });
  });

  describe('addMessageToChat', () => {
    it('should add a message to the chat', async () => {
      const chat = { id: '1', users: [], messages: [] };
      const user = { id: '1', name: 'User', email: 'user@example.com' };
      mockChatService.findById.mockResolvedValue(chat);
      mockUserService.findById.mockResolvedValue(user);

      const result = await resolver.addMessageToChat('1', 'message', '1');

      expect(result).toBe(true);
      expect(mockChatService.findById).toHaveBeenCalledWith('1');
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(mockChatService.addMessageToChatQueue).toHaveBeenCalledWith('1', 'message', '1');
    });

    it('should throw an error if chat is not found', async () => {
      mockChatService.findById.mockResolvedValue(null);

      await expect(resolver.addMessageToChat('1', 'message', '1')).rejects.toThrow(HttpException);
      await expect(resolver.addMessageToChat('1', 'message', '1')).rejects.toThrow('Chat not found');
    });

    it('should throw an error if user is not found', async () => {
      const chat = { id: '1', users: [], messages: [] };
      mockChatService.findById.mockResolvedValue(chat);
      mockUserService.findById.mockResolvedValue(null);

      await expect(resolver.addMessageToChat('1', 'message', '1')).rejects.toThrow(HttpException);
      await expect(resolver.addMessageToChat('1', 'message', '1')).rejects.toThrow('Author not found');
    });
  });

  describe('addUser', () => {
    it('should add a user to the chat', async () => {
      const chat = { id: '1', users: [], messages: [] };
      const user = { id: '1', name: 'User', email: 'user@example.com' };
      mockChatService.findById.mockResolvedValue(chat);
      mockUserService.findById.mockResolvedValue(user);
      mockChatService.addUser.mockResolvedValue(chat);

      const result = await resolver.addUser('1', '1');

      expect(result).toEqual(chat);
      expect(mockChatService.findById).toHaveBeenCalledWith('1');
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(mockChatService.addUser).toHaveBeenCalledWith('1', '1');
    });

    it('should throw an error if chat is not found', async () => {
      mockChatService.findById.mockResolvedValue(null);

      await expect(resolver.addUser('1', '1')).rejects.toThrow(HttpException);
      await expect(resolver.addUser('1', '1')).rejects.toThrow('Chat not found');
    });

    it('should throw an error if user is not found', async () => {
      const chat = { id: '1', users: [], messages: [] };
      mockChatService.findById.mockResolvedValue(chat);
      mockUserService.findById.mockResolvedValue(null);

      await expect(resolver.addUser('1', '1')).rejects.toThrow(HttpException);
      await expect(resolver.addUser('1', '1')).rejects.toThrow('User not found');
    });
  });
});
