
import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import EnhancedProductCard from '@/components/EnhancedProductCard';
import ProductFilters from '@/components/ProductFilters';
import ProductBreadcrumb from '@/components/ProductBreadcrumb';
import ProductsHeader from '@/components/ProductsHeader';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
}

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  isNew: boolean;
  onSale: boolean;
  inStockOnly: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 100000],
    isNew: false,
    onSale: false,
    inStockOnly: false,
  });

  // Create a normalize function that can be reused
  const normalizeCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription for product changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          // Refetch products when any product changes
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Failed to load products from database",
        variant: "destructive",
      });
    } else {
      // Transform database products to match the expected Product interface
      const transformedProducts: Product[] = (data || []).map((dbProduct: DatabaseProduct) => ({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image_url || '/placeholder.svg',
        category: dbProduct.category as Product['category'],
        description: dbProduct.description || '',
        popularity: Math.floor(Math.random() * 100),
        isNew: Math.random() > 0.7, // 30% chance of being new
        stockQuantity: dbProduct.stock_quantity,
        inStock: dbProduct.stock_quantity > 0,
      }));
      
      setProducts(transformedProducts);
    }
    setLoading(false);
  };

  // Calculate product counts by category with case-insensitive matching
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    products.forEach(product => {
      const normalizedCategory = normalizeCategory(product.category);
      counts[normalizedCategory] = (counts[normalizedCategory] || 0) + 1;
    });
    
    return counts;
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Category filter with case-insensitive matching
      if (filters.categories.length > 0) {
        const normalizedProductCategory = normalizeCategory(product.category);
        const hasMatchingCategory = filters.categories.some(filterCategory => 
          normalizeCategory(filterCategory) === normalizedProductCategory
        );
        if (!hasMatchingCategory) {
          return false;
        }
      }
      
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }
      
      // New products filter
      if (filters.isNew && !product.isNew) {
        return false;
      }
      
      // Sale filter (would need sale data in real app)
      if (filters.onSale) {
        // This would check if product is on sale
      }
      
      return true;
    });

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return Math.random() - 0.5; // Random for demo
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });

    return sorted;
  }, [products, filters, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
    if (filters.isNew) count++;
    if (filters.onSale) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  const breadcrumbItems = [
    { label: 'Products' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navigation />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-6"></div>
              <p className="text-navy/60">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clearAllFiltersAction = () => setFilters({
    categories: [],
    priceRange: [0, 100000],
    isNew: false,
    onSale: false,
    inStockOnly: false,
  });

  return (
    <div className="min-h-screen bg-ivory">
      <Navigation />
      <div className="pt-28">
        <div className="flex w-full max-w-7xl mx-auto">
          {/* Desktop Sidebar with Enhanced Scrollbar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-white rounded-lg shadow-sm mr-6 border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-xl font-playfair font-bold text-navy">Filters</h2>
                </div>
                <div className="p-5">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    productCounts={productCounts}
                    totalProducts={products.length}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-0">
            <div className="py-6">
              <ProductBreadcrumb items={breadcrumbItems} />
              
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-navy mb-4">
                  Our Collection
                </h1>
                <p className="text-gray-600 max-w-3xl leading-relaxed">
                  Discover our exquisite selection of handcrafted jewelry pieces, each telling its own unique story.
                </p>
              </div>

              {/* Mobile Filter Sheet */}
              <div className="lg:hidden mb-6">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-navy min-h-[48px] px-4"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md pt-20">
                    <SheetHeader className="pb-6">
                      <SheetTitle className="text-navy font-playfair">Filters</SheetTitle>
                    </SheetHeader>
                    <ProductFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      productCounts={productCounts}
                      totalProducts={products.length}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Products Header */}
              <ProductsHeader
                totalProducts={filteredAndSortedProducts.length}
                currentPage={currentPage}
                productsPerPage={productsPerPage}
                sortBy={sortBy}
                onSortChange={setSortBy}
                view={view}
                onViewChange={setView}
                activeFiltersCount={activeFiltersCount}
              />

              {/* Products Grid/List */}
              <div className={
                view === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }>
                {paginatedProducts.map((product) => (
                  <EnhancedProductCard 
                    key={product.id} 
                    product={product} 
                    view={view}
                  />
                ))}
              </div>

              {/* No Results */}
              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-playfair text-navy mb-4">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to see more products.</p>
                  <Button
                    onClick={clearAllFiltersAction}
                    className="bg-gold hover:bg-gold-dark text-navy min-h-[48px] px-6"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  {/* Mobile: Simple prev/next */}
                  <div className="flex sm:hidden items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-gold text-gold hover:bg-gold hover:text-navy disabled:opacity-50 min-h-[48px] px-4"
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-sm text-navy bg-white border rounded-lg min-h-[48px] flex items-center">
                      {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gold text-gold hover:bg-gold hover:text-navy disabled:opacity-50 min-h-[48px] px-4"
                    >
                      Next
                    </Button>
                  </div>

                  {/* Desktop: Full pagination */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-gold text-gold hover:bg-gold hover:text-navy disabled:opacity-50 min-h-[48px]"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page 
                              ? "bg-gold text-navy min-h-[48px]" 
                              : "border-gold text-gold hover:bg-gold hover:text-navy min-h-[48px]"
                            }
                            size="sm"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gold text-gold hover:bg-gold hover:text-navy disabled:opacity-50 min-h-[48px]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
