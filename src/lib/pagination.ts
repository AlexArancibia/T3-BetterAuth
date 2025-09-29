import { z } from "zod";

// Schema de paginación para validación de input
export const paginationInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

// Tipo de respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Función helper para crear respuestas paginadas
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Helper para calcular offset
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// Helper para crear filtros de búsqueda con Prisma
export function createSearchFilter(
  search?: string,
  fields: string[] = []
):
  | { OR?: Array<{ [key: string]: { contains: string; mode: string } }> }
  | Record<string, never> {
  if (!search || fields.length === 0) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    })),
  };
}

// Helper para crear ordenamiento con Prisma
export function createSortOrder(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc",
  fieldMapping?: Record<string, string>
): { [key: string]: "asc" | "desc" } {
  if (!sortBy) {
    return { createdAt: sortOrder };
  }

  // Apply field mapping if provided
  const mappedSortBy = fieldMapping?.[sortBy] ? fieldMapping[sortBy] : sortBy;

  return { [mappedSortBy]: sortOrder };
}

// Hook personalizado para manejo de paginación en el frontend
export interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  reset: () => void;
  getQueryParams: () => PaginationInput;
}

// Componente de paginación UI
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationComponentProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  showLimitSelector?: boolean;
  limitOptions?: number[];
}

// Constantes por defecto
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  limitOptions: [5, 10, 20, 50, 100],
} as const;
