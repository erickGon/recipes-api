import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Recipe } from './entities/recipe.entity';

const TOTAL_RECIPES = 200;
faker.seed(20251107);

const baseMedications = [
  'Amoxicillin',
  'Lisinopril',
  'Metformin',
  'Atorvastatin',
  'Azithromycin',
  'Losartan',
  'Hydrochlorothiazide',
  'Levothyroxine',
  'Omeprazole',
  'Sertraline',
  'TestMedication',
];

const seedRecipes: Recipe[] = Array.from(
  { length: TOTAL_RECIPES },
  (_, index) => {
    const issuedAt = faker.date.between({
      from: new Date('2024-01-01T00:00:00Z'),
      to: new Date('2025-12-31T23:59:59Z'),
    });

    const medicationName = `${faker.helpers.arrayElement(baseMedications)} ${faker.number.int({ min: 10, max: 1000 })}mg`;
    const patientSuffix = (10000 + index).toString().slice(-5);

    return {
      id: faker.string.uuid(),
      patientId: `PAT-${patientSuffix}`,
      medication: medicationName,
      issuedAt,
      doctor: faker.person.fullName(),
      notes: faker.lorem.sentence({ min: 6, max: 12 }),
    } satisfies Recipe;
  },
);

export interface PaginatedRecipes {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeFilters {
  medicationName?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class RecipesService {
  private recipes: Recipe[] = [...seedRecipes];

  findAll(page = 1, limit = 10, filters: RecipeFilters = {}): PaginatedRecipes {
    const safeLimit = Math.max(1, Math.min(limit, TOTAL_RECIPES));
    const safePage = Math.max(1, page);
    const medicationQuery = filters.medicationName?.toLowerCase().trim();

    const filteredRecipes = this.recipes.filter((recipe) => {
      if (medicationQuery) {
        if (!recipe.medication.toLowerCase().includes(medicationQuery)) {
          return false;
        }
      }
      if (filters.startDate && filters.endDate) {
        if (recipe.issuedAt < filters.startDate) {
          return false;
        }

        if (recipe.issuedAt > filters.endDate) {
          return false;
        }
      }

      return true;
    });

    const total = filteredRecipes.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(safePage, totalPages);
    const startIndex = (currentPage - 1) * safeLimit;
    const data = filteredRecipes.slice(startIndex, startIndex + safeLimit);

    return {
      data,
      total,
      page: currentPage,
      limit: safeLimit,
      totalPages,
    };
  }
}
