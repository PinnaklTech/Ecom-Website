
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast({
        title: "Item unavailable",
        description: "This item is currently out of stock",
        variant: "destructive",
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
              className="bg-gold hover:bg-gold-dark text-navy font-semibold w-full"
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

  return (
    <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="aspect-square overflow-hidden relative">
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
      
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base sm:text-lg font-playfair font-semibold text-navy group-hover:text-gold transition-colors leading-tight flex-1 pr-2">
            {product.name}
          </h3>
          {product.isNew && (
            <span className="bg-gold text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
              New
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center gap-2 text-xs mb-4">
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
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full font-semibold text-sm py-2.5 min-h-[44px] transition-all duration-300 ${
                product.inStock 
                  ? 'bg-gold hover:bg-gold-dark text-navy' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
