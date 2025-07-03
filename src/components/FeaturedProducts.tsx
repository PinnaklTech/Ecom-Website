import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { DatabaseService } from '@/services/database';
import { Product } from '@/types/product';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await DatabaseService.getProducts({ 
        isActive: true, 
        isFeatured: true 
      });

      // Transform MongoDB products to match the expected Product interface
      const transformedProducts: Product[] = data.map((dbProduct: any) => ({
        id: dbProduct._id.toString(),
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.imageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        category: dbProduct.category as Product['category'],
        description: dbProduct.description || '',
        popularity: Math.floor(Math.random() * 100), // Random popularity since it's not in DB
        isNew: false,
        stockQuantity: dbProduct.stockQuantity,
        inStock: dbProduct.stockQuantity > 0,
      }));
      
      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
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