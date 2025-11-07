import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { RecipesService } from './recipes.service';
import type { PaginatedRecipes, RecipeFilters } from './recipes.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('recipes')
@UseGuards(FirebaseAuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(
    @Request() req: ExpressRequest & { user?: DecodedIdToken },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('medicationName') medicationName?: string,
    @Query('startDate') startDateRaw?: string,
    @Query('endDate') endDateRaw?: string,
  ): PaginatedRecipes {
    // Log the authenticated Firebase user ID this would be used if data came from database to check against the user id and only return data for that user.
    console.info('Authenticated user ID:', req.user?.uid);
    console.info('User email:', req.user?.email);

    const filters: RecipeFilters = {};

    if (medicationName) {
      filters.medicationName = medicationName;
    }

    if (startDateRaw) {
      const startDate = new Date(startDateRaw);
      if (Number.isNaN(startDate.getTime())) {
        throw new BadRequestException(
          'startDate must be a valid ISO-8601 date string',
        );
      }
      filters.startDate = startDate;
    }

    if (endDateRaw) {
      const endDate = new Date(endDateRaw);
      if (Number.isNaN(endDate.getTime())) {
        throw new BadRequestException(
          'endDate must be a valid ISO-8601 date string',
        );
      }
      filters.endDate = endDate;
    }

    if (filters.startDate && filters.endDate) {
      if (filters.startDate > filters.endDate) {
        throw new BadRequestException(
          'startDate must be before or equal to endDate',
        );
      }
    }

    return this.recipesService.findAll(page, limit, filters);
  }
}
