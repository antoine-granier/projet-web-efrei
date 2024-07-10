import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { HttpException } from '@nestjs/common';
import { isValidEmail } from '../utils';
jest.mock('../utils', () => ({
  isValidEmail: jest.fn(),
}));

describe('UserResolver', () => {
  let resolver: UserResolver;

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', name: 'User1', email: 'user1@example.com' }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await resolver.getUsers();

      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const user = { id: '1', name: 'User1', email: 'user1@example.com' };
      mockUserService.findById.mockResolvedValue(user);

      const result = await resolver.getUserById('1');

      expect(result).toEqual(user);
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw an error if user is not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(resolver.getUserById('1')).rejects.toThrow(HttpException);
      await expect(resolver.getUserById('1')).rejects.toThrow('User not found');
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', name: 'User1', email: 'user1@example.com' };
      (isValidEmail as jest.Mock).mockReturnValue(true);
      mockUserService.findByEmail.mockResolvedValue(user);

      const result = await resolver.getUserByEmail('user1@example.com');

      expect(result).toEqual(user);
      expect(isValidEmail).toHaveBeenCalledWith('user1@example.com');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'user1@example.com',
      );
    });

    it('should throw an error if email format is invalid', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(false);

      await expect(resolver.getUserByEmail('invalid-email')).rejects.toThrow(
        HttpException,
      );
      await expect(resolver.getUserByEmail('invalid-email')).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should throw an error if user is not found', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        resolver.getUserByEmail('user1@example.com'),
      ).rejects.toThrow(HttpException);
      await expect(
        resolver.getUserByEmail('user1@example.com'),
      ).rejects.toThrow('User not found');
    });
  });
});
