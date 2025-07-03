import { AuthResponse, AuthUser, CartItem } from '@/types/database';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class DatabaseService {
  // Helper method to make API requests
  private static async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth Methods
  static async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<AuthResponse> {
    try {
      return await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  static async signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      return await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
    }
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      return await this.apiRequest(`/users/${userId}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      return await this.apiRequest('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  // Product Methods
  static async getProducts(filters?: {
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.apiRequest(endpoint);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  static async getProductById(productId: string) {
    try {
      return await this.apiRequest(`/products/${productId}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  static async createProduct(productData: {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    stockQuantity: number;
    isActive?: boolean;
    isFeatured?: boolean;
  }) {
    try {
      return await this.apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  static async updateProduct(productId: string, updateData: any) {
    try {
      return await this.apiRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  static async deleteProduct(productId: string) {
    try {
      return await this.apiRequest(`/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Appointment Methods
  static async createAppointment(appointmentData: {
    userId: string;
    appointmentDate: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    cartItems: CartItem[];
    totalAmount: number;
  }) {
    try {
      return await this.apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  static async getAppointmentsByUserId(userId: string) {
    try {
      return await this.apiRequest(`/appointments/user/${userId}`);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  static async getAllAppointments() {
    try {
      return await this.apiRequest('/appointments');
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      return await this.apiRequest(`/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  static async getAppointmentById(appointmentId: string) {
    try {
      return await this.apiRequest(`/appointments/${appointmentId}`);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw new Error('Failed to fetch appointment');
    }
  }
}