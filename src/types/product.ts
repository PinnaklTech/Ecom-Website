export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets';
  description: string;
  popularity: number;
  isNew?: boolean;
  stockQuantity: number;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  preferredDate: Date;
  preferredTime: string;
  notes?: string;
}
