import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../models/user.model';
import { isValidEmail } from '../utils';

jest.mock('../utils', () => ({
  isValidEmail: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let cacheManager: Cache;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should throw error if email is invalid', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(false);

      await expect(service.findByEmail('invalid-email')).rejects.toThrow(HttpException);
      await expect(service.findByEmail('invalid-email')).rejects.toThrow('Invalid email format');
    });

    it('should return user if email is valid', async () => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      (isValidEmail as jest.Mock).mockReturnValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
    });
  });

  describe('create', () => {
    it('should throw error if email is invalid', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(false);

      await expect(service.create('John Doe', 'invalid-email')).rejects.toThrow(HttpException);
      await expect(service.create('John Doe', 'invalid-email')).rejects.toThrow('Invalid email format');
    });

    it('should throw error if user already exists', async () => {
      const existingUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      (isValidEmail as jest.Mock).mockReturnValue(true);
      jest.spyOn(service, 'findByEmail').mockResolvedValue(existingUser);

      await expect(service.create('John Doe', 'john@example.com')).rejects.toThrow(HttpException);
      await expect(service.create('John Doe', 'john@example.com')).rejects.toThrow('User already exists');
    });

    it('should create and return new user if email is valid and does not exist', async () => {
      const newUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      (isValidEmail as jest.Mock).mockReturnValue(true);
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.create('John Doe', 'john@example.com');

      expect(result).toEqual(newUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: { name: 'John Doe', email: 'john@example.com' } });
    });
  });
});
