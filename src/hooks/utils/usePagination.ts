import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Only exported for PaginationControls component
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

interface UsePaginationProps {
  totalItems: number;
}

const QUERY_PARAMS = {
  PAGE: 'page',
  SIZE: 'size',
} as const;

export function usePagination({ totalItems }: UsePaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get(QUERY_PARAMS.PAGE);
    return page ? parseInt(page) : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    const size = searchParams.get(QUERY_PARAMS.SIZE);
    return size && PAGE_SIZE_OPTIONS.includes(parseInt(size)) ? parseInt(size) : DEFAULT_PAGE_SIZE;
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Update URL when state changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(QUERY_PARAMS.PAGE, currentPage.toString());
    newParams.set(QUERY_PARAMS.SIZE, pageSize.toString());
    setSearchParams(newParams, { replace: true });
  }, [currentPage, pageSize, searchParams, setSearchParams]);

  // Handle page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Calculate paginated items
  const getPaginatedItems = <T>(items: T[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    getPaginatedItems,
  };
}
