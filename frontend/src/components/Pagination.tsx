// components/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  className?: string;
  showPageInfo?: boolean;
  size?: 'sm' | 'default' | 'lg';
}


export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  className = '',
  showPageInfo = true,
  size = 'sm',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-end space-x-2 py-4 ${className}`}>
      <Button
        variant="outline"
        size={size}
        onClick={onPreviousPage}
        disabled={!hasPreviousPage}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      {showPageInfo && (
        <div className="text-sm text-muted-foreground px-2">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <Button
        variant="outline"
        size={size}
        onClick={onNextPage}
        disabled={!hasNextPage}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};