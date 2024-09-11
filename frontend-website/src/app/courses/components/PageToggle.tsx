"use client"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PageToggleProps {
  currentPage: number;
  totalPages: number;
}

export function PageToggle({ currentPage, totalPages }: PageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let pageGroupSize = totalPages;
  if (totalPages > 7) {
    pageGroupSize = 7;
  }
  

  function handlePageChange(page: number) {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      router.push(`${pathname}?${params.toString()}`);
  }

  const currentGroupStart = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const currentGroupEnd = Math.min(currentGroupStart + pageGroupSize - 1, totalPages);
  const nextGroupStart = currentGroupEnd + 1;

  return (
    <Pagination className="py-2 sm:py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} />
        </PaginationItem>

        {/* Show the group of pages (1,2,3 or 4,5,6 etc.) */}
        {Array.from({ length: currentGroupEnd - currentGroupStart + 1 }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={currentGroupStart + i === currentPage} onClick={() => handlePageChange(currentGroupStart + i)}>
              {currentGroupStart + i}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Show clickable ellipsis taht toggles to nest group of pages if there are more pages */}
        {currentGroupEnd < totalPages && (
          <PaginationItem className="rounded-md hover:bg-gray-100">
            <PaginationEllipsis onClick={() => handlePageChange(nextGroupStart)} />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext href="#" onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
