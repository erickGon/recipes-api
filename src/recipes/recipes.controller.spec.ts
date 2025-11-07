import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService;

  const mockRequest = {
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      aud: 'test-audience',
      auth_time: 1715136000,
      exp: 1715136000,
      iat: 1715136000,
      iss: 'https://firebase.google.com/project/test-project',
      sub: 'test-user-id',
      firebase: {
        sign_in_provider: 'email',
        identities: {
          email: ['test@example.com'],
        },
      },
    },
  } as unknown as ExpressRequest & { user?: DecodedIdToken };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [RecipesService],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated recipes with default parameters', () => {
      const result = controller.findAll(mockRequest, 1, 10);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
    });

    it('should pass page and limit to service', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      controller.findAll(mockRequest, 2, 20);

      expect(serviceSpy).toHaveBeenCalledWith(2, 20, {});
    });

    it('should pass medication filter to service', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      controller.findAll(mockRequest, 1, 10, 'statin');

      expect(serviceSpy).toHaveBeenCalledWith(1, 10, {
        medicationName: 'statin',
      });
    });

    it('should parse and pass startDate to service', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      const dateString = '2025-01-01';
      controller.findAll(mockRequest, 1, 10, undefined, dateString);

      expect(serviceSpy).toHaveBeenCalledWith(1, 10, {
        startDate: new Date(dateString),
      });
    });

    it('should parse and pass endDate to service', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      const dateString = '2025-12-31';
      controller.findAll(mockRequest, 1, 10, undefined, undefined, dateString);

      expect(serviceSpy).toHaveBeenCalledWith(1, 10, {
        endDate: new Date(dateString),
      });
    });

    it('should pass all filters to service', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      controller.findAll(
        mockRequest,
        1,
        10,
        'statin',
        '2025-01-01',
        '2025-12-31',
      );

      expect(serviceSpy).toHaveBeenCalledWith(1, 10, {
        medicationName: 'statin',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      });
    });

    it('should throw BadRequestException for invalid startDate', () => {
      expect(() => {
        controller.findAll(mockRequest, 1, 10, undefined, 'invalid-date');
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid endDate', () => {
      expect(() => {
        controller.findAll(
          mockRequest,
          1,
          10,
          undefined,
          undefined,
          'invalid-date',
        );
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate > endDate', () => {
      expect(() => {
        controller.findAll(
          mockRequest,
          1,
          10,
          undefined,
          '2025-12-31',
          '2025-01-01',
        );
      }).toThrow(BadRequestException);
    });

    it('should accept valid date range', () => {
      expect(() => {
        controller.findAll(
          mockRequest,
          1,
          10,
          undefined,
          '2025-01-01',
          '2025-12-31',
        );
      }).not.toThrow();
    });

    it('should accept equal startDate and endDate', () => {
      expect(() => {
        controller.findAll(
          mockRequest,
          1,
          10,
          undefined,
          '2025-06-15',
          '2025-06-15',
        );
      }).not.toThrow();
    });

    it('should handle undefined optional parameters', () => {
      const serviceSpy = jest.spyOn(service, 'findAll');
      controller.findAll(mockRequest, 1, 10);

      expect(serviceSpy).toHaveBeenCalledWith(1, 10, {});
    });
  });
});
