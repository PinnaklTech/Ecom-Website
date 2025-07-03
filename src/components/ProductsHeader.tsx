
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ViewToggle from './ViewToggle';

interface ProductsHeaderProps {
  totalProducts: number;
  currentPage: number;
  productsPerPage: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  activeFiltersCount: number;
}

const ProductsHeader = ({
  totalProducts,
  currentPage,
  productsPerPage,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  activeFiltersCount
}: ProductsHeaderProps) => {
  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'name', label: 'Name A-Z' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      {/* Results info and filters count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-600">
            Showing {startItem}-{endItem} of {totalProducts} results
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-xs bg-gold/10 text-gold px-3 py-1.5 rounded-full w-fit font-medium">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <span className="text-sm text-gray-600 font-medium sm:whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-56 min-h-[48px] border-gray-200">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {sortOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="cursor-pointer hover:bg-gray-50 min-h-[48px] flex items-center"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center sm:justify-end">
          <ViewToggle view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </div>
  );
};

export default ProductsHeader;
