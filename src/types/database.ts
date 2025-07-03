export interface User {
  _id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Appointment {
  _id: string;
  userId: string;
  appointmentDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  cartItems: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}