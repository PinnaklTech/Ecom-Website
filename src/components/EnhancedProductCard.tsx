
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EnhancedProductCardProps {
  product: Product;
  view: 'grid' | 'list';
  showAddToCart?: boolean;
}

const EnhancedProductCard = ({ product, view, showAddToCart = true }: EnhancedProductCardProps) => {
  const { dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast({
        title: "Item unavailable",
        description: "This item is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">Please sign in to add items to cart</span>
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="bg-gold hover:bg-gold-dark text-navy font-semibold w-full min-h-[44px]"
            >
              Sign In
            </Button>
          </div>
        ),
        duration: 5000,
      });
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: product });
    toast({
      title: "Item added to cart successfully!",
      description: (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-600">{product.name}</span>
          <Link to="/cart">
            <Button 
              size="sm" 
              className="bg-gold hover:bg-gold-dark text-navy font-semibold w-full min-h-[44px]"
            >
              View Cart
            </Button>
          </Link>
        </div>
      ),
      duration: 4000,
    });
  };

  const getStockDisplay = () => {
    if (!product.inStock) {
      return { text: "Out of Stock", color: "text-red-500" };
    }
    if (product.stockQuantity <= 5) {
      return { text: `Only ${product.stockQuantity} left`, color: "text-orange-500" };
    }
    return { text: "In Stock", color: "text-green-500" };
  };

  const stockInfo = getStockDisplay();

  const getButtonContent = () => {
    if (!product.inStock) return 'Out of Stock';
    if (!user) return 'Sign in to Add';
    return 'Add to Cart';
  };

  const isButtonDisabled = !product.inStock;
  const buttonClassName = `w-full font-semibold transition-all duration-300 ${
    isButtonDisabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-gold hover:bg-gold-dark text-navy'
  }`;

  if (view === 'list') {
    return (
      <div className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 ${!product.inStock ? 'opacity-75' : ''}`}>
        <div className="w-full sm:w-52 h-52 flex-shrink-0 overflow-hidden rounded-lg relative">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!product.inStock ? 'grayscale' : ''}`}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-navy group-hover:text-gold transition-colors leading-tight">
                {product.name}
              </h3>
              {product.isNew && (
                <span className="bg-gold text-white text-xs px-3 py-1.5 rounded-full w-fit font-medium">
                  New
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={stockInfo.color}>{stockInfo.text}</span>
              </span>
              {product.inStock && <span className="text-gray-600">2-Day Delivery</span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-2xl sm:text-3xl font-bold text-navy">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            
            {showAddToCart && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className={`${buttonClassName} sm:w-auto px-6 py-3 min-h-[48px]`}
                >
                  {getButtonContent()}
                </Button>
                {!user && product.inStock && (
                  <span className="text-xs text-gray-500 text-center sm:text-right">Login required</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!product.inStock ? 'grayscale' : ''}`}
        />
        {product.isNew && product.inStock && (
          <span className="absolute top-3 left-3 bg-gold text-white text-xs px-3 py-1.5 rounded-full font-medium">
            New
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-playfair font-semibold text-navy group-hover:text-gold transition-colors leading-tight mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={stockInfo.color}>{stockInfo.text}</span>
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-xl sm:text-2xl font-bold text-navy">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          
          {showAddToCart && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className={`${buttonClassName} text-sm py-2.5 min-h-[48px]`}
              >
                {getButtonContent()}
              </Button>
              {!user && product.inStock && (
                <span className="text-xs text-gray-500 text-center">Login required</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
