import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipesService],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated recipes with default params', () => {
      const result = service.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.total).toBe(200); // Seeded with 200 recipes
    });

    it('should respect page and limit parameters', () => {
      const result = service.findAll(2, 20);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.data.length).toBeLessThanOrEqual(20);
    });

    it('should cap limit at 200 (TOTAL_RECIPES)', () => {
      const result = service.findAll(1, 300);

      expect(result.limit).toBe(200);
      expect(result.data.length).toBe(200);
    });

    it('should enforce minimum page of 1', () => {
      const result = service.findAll(0, 10);

      expect(result.page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      const result = service.findAll(1, 0);

      expect(result.limit).toBe(1);
    });

    it('should filter by medication name (case-insensitive)', () => {
      const result = service.findAll(1, 100, { medicationName: 'statin' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((recipe) => {
        expect(recipe.medication.toLowerCase()).toContain('statin');
      });
    });

    it('should not filter by startDate alone', () => {
      const startDate = new Date('2025-01-01');
      const result = service.findAll(1, 100, { startDate });

      // Without endDate, date filtering is skipped
      expect(result.total).toBe(200);
    });

    it('should not filter by endDate alone', () => {
      const endDate = new Date('2025-06-30');
      const result = service.findAll(1, 100, { endDate });

      // Without startDate, date filtering is skipped
      expect(result.total).toBe(200);
    });

    it('should filter by date range', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-06-30');
      const result = service.findAll(1, 100, { startDate, endDate });

      result.data.forEach((recipe) => {
        expect(recipe.issuedAt.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime(),
        );
        expect(recipe.issuedAt.getTime()).toBeLessThanOrEqual(
          endDate.getTime(),
        );
      });
    });

    it('should combine multiple filters', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-06-30');
      const result = service.findAll(1, 100, {
        medicationName: 'statin',
        startDate,
        endDate,
      });

      result.data.forEach((recipe) => {
        expect(recipe.medication.toLowerCase()).toContain('statin');
        expect(recipe.issuedAt.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime(),
        );
        expect(recipe.issuedAt.getTime()).toBeLessThanOrEqual(
          endDate.getTime(),
        );
      });
    });

    it('should return empty array when no recipes match filters', () => {
      const result = service.findAll(1, 10, {
        medicationName: 'nonexistent-medication-xyz',
      });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should calculate totalPages correctly', () => {
      const result = service.findAll(1, 10);

      expect(result.totalPages).toBe(Math.ceil(result.total / 10));
    });

    it('should adjust page if it exceeds totalPages', () => {
      const result = service.findAll(999, 10);

      expect(result.page).toBe(result.totalPages);
    });
  });
});
