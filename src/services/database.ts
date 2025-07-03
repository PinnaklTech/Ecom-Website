import { AuthResponse, AuthUser, CartItem } from '@/types/database';

export class DatabaseService {
  private static baseUrl = '/api'; // This would be your backend API URL

  // Helper method for making API requests
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
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
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      return await this.makeRequest(`/users/${userId}`);
    } catch (error) {
      return null;
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      return await this.makeRequest('/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
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
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  static async getProductById(productId: string) {
    return this.makeRequest(`/products/${productId}`);
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
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  static async updateProduct(productId: string, updateData: any) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  static async deleteProduct(productId: string) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
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
    return this.makeRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  static async getAppointmentsByUserId(userId: string) {
    return this.makeRequest(`/appointments/user/${userId}`);
  }

  static async getAllAppointments() {
    return this.makeRequest('/appointments');
  }

  static async updateAppointmentStatus(appointmentId: string, status: string) {
    return this.makeRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  static async getAppointmentById(appointmentId: string) {
    return this.makeRequest(`/appointments/${appointmentId}`);
  }

  // Mock data for development (remove when backend is ready)
  static async seedInitialData() {
    // This method is now empty since seeding should be handled by the backend
    // The backend should handle initial data seeding when it starts up
    console.log('Data seeding should be handled by the backend API');
  }
}