"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { PaginationComponentProps } from "../../lib/pagination";

export function PaginationComponent({
  pagination,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  limitOptions = [5, 10, 20, 50, 100],
}: PaginationComponentProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  // Calcular rango de páginas a mostrar (más compacto)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2">
      {/* Información de resultados */}
      <div className="text-sm text-gray-500 order-2 sm:order-1 whitespace-nowrap">
        {total > 0 && (
          <span>
            {startItem}-{endItem} de {total.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 order-1 sm:order-2">
        {/* Selector de filas por página */}
        {showLimitSelector && total > Math.min(...limitOptions) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">
              Mostrar
            </span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="text-sm border-0 bg-transparent text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded px-1 py-0.5"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de navegación */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Botón anterior */}
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrev}
              className="flex items-center justify-center w-8 h-8 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-gray-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNumber, index) =>
                pageNumber === "..." ? (
                  <div
                    key={`ellipsis-${index}-${Math.random()}`}
                    className="flex items-center justify-center w-8 h-8"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                ) : (
                  <button
                    key={`page-${pageNumber}`}
                    type="button"
                    onClick={() => onPageChange(pageNumber as number)}
                    className={`flex items-center justify-center w-8 h-8 text-sm rounded-md transition-colors ${
                      pageNumber === page
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={`Página ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>

            {/* Botón siguiente */}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
              className="flex items-center justify-center w-8 h-8 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-gray-50"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
