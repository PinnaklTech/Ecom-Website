
import React from 'react';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-playfair font-bold text-navy mb-4">Your Cart</h1>
              <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
              <Button
                onClick={() => navigate('/products')}
                className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8 py-3"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-playfair font-bold text-navy mb-8">Your Cart</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            {state.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-playfair font-semibold text-navy text-lg">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-navy">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-navy">Total: ₹{state.total.toLocaleString('en-IN')}</span>
                <span className="text-gray-600">({state.itemCount} items)</span>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => navigate('/book-appointment')}
                  className="flex-1 bg-gold hover:bg-gold-dark text-navy font-semibold"
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
