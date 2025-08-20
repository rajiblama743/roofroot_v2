import { IPaginationQuery, IPaginationResponse } from '../types/common';

export function parsePaginationQuery(query: any): IPaginationQuery {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  
  return { page, limit };
}

export function createPaginationResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): IPaginationResponse<T> {
  const hasMore = page * limit < total;
  
  return {
    items,
    page,
    limit,
    total,
    hasMore
  };
}

export function getSkipValue(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function validatePagination(page: number, limit: number): boolean {
  return page > 0 && limit > 0 && limit <= 100;
}

// Ensure pagination values are always valid numbers
export function ensureValidPagination(page?: number, limit?: number): { page: number; limit: number } {
  return {
    page: Math.max(1, page || 1),
    limit: Math.min(100, Math.max(1, limit || 20))
  };
}
