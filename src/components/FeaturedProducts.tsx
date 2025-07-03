
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
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
  is_featured: boolean;
}

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();

    // Set up real-time subscription for product changes
    const channel = supabase
      .channel('featured-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          // Refetch featured products when any product changes
          fetchFeaturedProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedProducts = async () => {
    // Only fetch products that are explicitly marked as featured
    const { data: featuredData, error: featuredError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (featuredError) {
      console.error('Error fetching featured products:', featuredError);
      setFeaturedProducts([]);
    } else {
      // Transform database products to match the expected Product interface
      const transformedProducts: Product[] = (featuredData || []).map((dbProduct: DatabaseProduct) => ({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image_url || '/placeholder.svg',
        category: dbProduct.category as Product['category'],
        description: dbProduct.description || '',
        popularity: Math.floor(Math.random() * 100), // Random popularity since it's not in DB
        isNew: false,
        stockQuantity: dbProduct.stock_quantity,
        inStock: dbProduct.stock_quantity > 0,
      }));
      
      setFeaturedProducts(transformedProducts);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-6"></div>
            <p className="text-navy/60 text-base">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  // If no featured products are set, don't render the section at all
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-navy mb-6 sm:mb-8 leading-tight">
            Featured Collection
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Discover our most beloved pieces, carefully curated for their exceptional craftsmanship and timeless elegance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/products">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-semibold px-8 sm:px-10 py-4 text-base sm:text-lg min-h-[52px] transition-all duration-300"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
