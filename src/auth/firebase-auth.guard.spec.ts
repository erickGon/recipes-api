import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from '../firebase/firebase.service';
import type { DecodedIdToken } from 'firebase-admin/auth';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let firebaseService: FirebaseService;

  const mockDecodedToken: DecodedIdToken = {
    uid: 'test-user-id',
    email: 'test@example.com',
    email_verified: true,
    aud: 'test-project',
    auth_time: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,
    iat: Date.now() / 1000,
    iss: 'https://securetoken.google.com/test-project',
    sub: 'test-user-id',
    firebase: {
      identities: { email: ['test@example.com'] },
      sign_in_provider: 'password',
    },
  };

  beforeEach(async () => {
    const mockFirebaseService = {
      verifyIdToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  const createMockExecutionContext = (
    authHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };

    const getRequest = () => mockRequest;

    return {
      switchToHttp: () => ({
        getRequest,
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const verifySpy = jest
        .spyOn(firebaseService, 'verifyIdToken')
        .mockResolvedValue(mockDecodedToken);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(verifySpy).toHaveBeenCalledWith('valid-token');
    });

    it('should attach decoded token to request.user', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: DecodedIdToken }>();
      jest
        .spyOn(firebaseService, 'verifyIdToken')
        .mockResolvedValue(mockDecodedToken);

      await guard.canActivate(context);

      expect(request.user).toEqual(mockDecodedToken);
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when authorization header is empty', async () => {
      const context = createMockExecutionContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      const context = createMockExecutionContext('Basic some-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const context = createMockExecutionContext('Bearer invalid-token');
      jest
        .spyOn(firebaseService, 'verifyIdToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const context = createMockExecutionContext('Bearer expired-token');
      jest
        .spyOn(firebaseService, 'verifyIdToken')
        .mockRejectedValue(new Error('Token expired'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should extract token correctly from Bearer header', async () => {
      const token = 'my-secret-token-12345';
      const context = createMockExecutionContext(`Bearer ${token}`);
      const verifySpy = jest
        .spyOn(firebaseService, 'verifyIdToken')
        .mockResolvedValue(mockDecodedToken);

      await guard.canActivate(context);

      expect(verifySpy).toHaveBeenCalledWith(token);
    });
  });
});
