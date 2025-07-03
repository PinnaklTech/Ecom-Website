
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  isNew: boolean;
  onSale: boolean;
  inStockOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  productCounts: Record<string, number>;
  totalProducts: number;
}

const ProductFilters = ({ filters, onFiltersChange, productCounts, totalProducts }: ProductFiltersProps) => {
  const categories = [
    { value: 'Rings', label: 'Rings' },
    { value: 'Necklaces', label: 'Necklaces' },
    { value: 'Earrings', label: 'Earrings' },
    { value: 'Bracelets', label: 'Bracelets' },
    { value: 'Pendants', label: 'Pendants' },
    { value: 'Chains', label: 'Chains' },
    { value: 'Watches', label: 'Watches' },
    { value: 'Accessories', label: 'Accessories' },
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, 100000],
      isNew: false,
      onSale: false,
      inStockOnly: false,
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 100000 ||
    filters.isNew || 
    filters.onSale ||
    filters.inStockOnly;

  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-4 pr-4">
        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-semibold text-navy">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gold hover:text-gold-dark hover:bg-gold/10 h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="font-semibold text-navy text-base">Categories</h3>
          <div className="space-y-1.5">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2.5 py-0.5">
                <Checkbox
                  id={category.value}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                  className="w-4 h-4"
                />
                <Label 
                  htmlFor={category.value} 
                  className="text-sm cursor-pointer flex-1 flex justify-between items-center"
                >
                  <span className="font-medium">{category.label}</span>
                  <span className="text-gray-500 text-xs font-normal">
                    ({productCounts[category.value] || 0})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Price Range */}
        <div className="space-y-3">
          <h3 className="font-semibold text-navy text-base">Price Range</h3>
          <div className="px-1 py-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
              <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Availability */}
        <div className="space-y-3">
          <h3 className="font-semibold text-navy text-base">Availability</h3>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5 py-0.5">
              <Checkbox
                id="inStockOnly"
                checked={filters.inStockOnly}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, inStockOnly: checked as boolean })}
                className="w-4 h-4"
              />
              <Label htmlFor="inStockOnly" className="text-sm cursor-pointer font-medium">
                In Stock Only
              </Label>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Special Offers */}
        <div className="space-y-3 pb-4">
          <h3 className="font-semibold text-navy text-base">Special Offers</h3>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5 py-0.5">
              <Checkbox
                id="isNew"
                checked={filters.isNew}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, isNew: checked as boolean })}
                className="w-4 h-4"
              />
              <Label htmlFor="isNew" className="text-sm cursor-pointer font-medium">
                New Arrivals
              </Label>
            </div>
            <div className="flex items-center space-x-2.5 py-0.5">
              <Checkbox
                id="onSale"
                checked={filters.onSale}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, onSale: checked as boolean })}
                className="w-4 h-4"
              />
              <Label htmlFor="onSale" className="text-sm cursor-pointer font-medium">
                On Sale
              </Label>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ProductFilters;
