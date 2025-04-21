import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show dots if current page is more than 3
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Show current page and 1 page before and after
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Show dots if current page is less than total pages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="mt-8 flex justify-center">
      <nav className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        
        {pageNumbers.map((pageNumber, index) => (
          pageNumber === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-700">...</span>
          ) : (
            <Button
              key={`page-${pageNumber}`}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(pageNumber))}
              className={
                currentPage === pageNumber 
                  ? "px-3 py-2 rounded bg-black text-white text-sm font-medium hover:bg-gray-800"
                  : "px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              }
            >
              {pageNumber}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </nav>
    </div>
  );
}
