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
import { useTransition } from 'react'
import { Spinner } from "@nextui-org/react";

interface PageToggleProps {
  currentPage: number;
  totalPages: number;
}

export default function PageToggle({ currentPage, totalPages }: PageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let pageGroupSize = totalPages;
  if (totalPages > 5) {
    pageGroupSize = 5;
  }
  const [isPending, startTransition] = useTransition()

  function handlePageChange(page: number) {
      const params = new URLSearchParams(searchParams);
      if (page === 1) {
        params.delete("page");
      }  else {
        params.set('page', page.toString());
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      })
  }

  const currentGroupStart = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const currentGroupEnd = Math.min(currentGroupStart + pageGroupSize - 1, totalPages);
  const nextGroupStart = currentGroupEnd + 1;

  return (
    <Pagination className="py-2 sm:py-4">
      <PaginationContent>
        {(currentPage > 1) && (
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} />
          </PaginationItem>
        )}
        

        {/* Show the group of pages (1,2,3 or 4,5,6 etc.) */}
        {Array.from({ length: currentGroupEnd - currentGroupStart + 1 }, (_, i) => (
          <PaginationItem key={i} className="cursor-pointer">
            <PaginationLink isActive={currentGroupStart + i === currentPage} onClick={() => handlePageChange(currentGroupStart + i)}>
              {currentGroupStart + i}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Show clickable ellipsis that toggles to nest group of pages if there are more pages */}
        {currentGroupEnd < totalPages && (
          <PaginationItem className="rounded-md hover:bg-gray-100 cursor-pointer">
            <PaginationEllipsis onClick={() => handlePageChange(nextGroupStart)} />
          </PaginationItem>
        )}
        {(currentPage < totalPages) && (
          <PaginationItem className="cursor-pointer">
            <PaginationNext onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} />
          </PaginationItem>
        )}
      </PaginationContent>
      {isPending &&(
        <div className="px-2">
          <Spinner color="default"/>
        </div>
      )}
    </Pagination>
  )
}
