import { AuthResponse, AuthUser, CartItem } from '@/types/database';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Appointment from '@/models/Appointment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export class DatabaseService {
  // Initialize database connection
  static async init() {
    try {
      await connectToDatabase();
      await this.seedInitialData();
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  // Helper method to generate JWT token
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  // Helper method to verify JWT token
  private static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return null;
    }
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
      await connectToDatabase();

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          ...(userData.username ? [{ username: userData.username }] : [])
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = new User({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        isAdmin: false,
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user data without password
      const userResponse: AuthUser = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        isAdmin: user.isAdmin,
      };

      return { user: userResponse, token };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  static async signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      await connectToDatabase();

      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user data without password
      const userResponse: AuthUser = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        isAdmin: user.isAdmin,
      };

      return { user: userResponse, token };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
    }
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      await connectToDatabase();
      const user = await User.findById(userId).select('-password');
      
      if (!user) return null;

      return {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        isAdmin: user.isAdmin,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      return await this.getUserById(decoded.userId);
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
      await connectToDatabase();
      
      const query: any = {};
      
      if (filters) {
        if (filters.category) query.category = filters.category;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          query.price = {};
          if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
          if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
        }
      }

      return await Product.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async getProductById(productId: string) {
    try {
      await connectToDatabase();
      return await Product.findById(productId);
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
      await connectToDatabase();
      
      const product = new Product({
        ...productData,
        isActive: productData.isActive ?? true,
        isFeatured: productData.isFeatured ?? false,
      });

      return await product.save();
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  static async updateProduct(productId: string, updateData: any) {
    try {
      await connectToDatabase();
      return await Product.findByIdAndUpdate(productId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  static async deleteProduct(productId: string) {
    try {
      await connectToDatabase();
      return await Product.findByIdAndDelete(productId);
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
      await connectToDatabase();
      
      const appointment = new Appointment({
        userId: appointmentData.userId,
        appointmentDate: appointmentData.appointmentDate,
        customerName: appointmentData.customerName,
        customerEmail: appointmentData.customerEmail,
        customerPhone: appointmentData.customerPhone,
        notes: appointmentData.notes,
        cartItems: appointmentData.cartItems,
        totalAmount: appointmentData.totalAmount,
        status: 'pending',
      });

      return await appointment.save();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  static async getAppointmentsByUserId(userId: string) {
    try {
      await connectToDatabase();
      return await Appointment.find({ userId }).sort({ appointmentDate: -1 });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  static async getAllAppointments() {
    try {
      await connectToDatabase();
      return await Appointment.find().sort({ appointmentDate: -1 }).populate('userId', 'email firstName lastName');
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      await connectToDatabase();
      return await Appointment.findByIdAndUpdate(
        appointmentId, 
        { status }, 
        { new: true }
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  static async getAppointmentById(appointmentId: string) {
    try {
      await connectToDatabase();
      return await Appointment.findById(appointmentId).populate('userId', 'email firstName lastName');
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw new Error('Failed to fetch appointment');
    }
  }

  // Seed initial data
  static async seedInitialData() {
    try {
      await connectToDatabase();

      // Check if admin user exists
      const adminExists = await User.findOne({ email: 'admin@zaffira.com' });
      
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const adminUser = new User({
          email: 'admin@zaffira.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          isAdmin: true,
        });

        await adminUser.save();
        console.log('Admin user created successfully');
      }

      // Check if products exist
      const productCount = await Product.countDocuments();
      
      if (productCount === 0) {
        const sampleProducts = [
          {
            name: 'Diamond Solitaire Ring',
            description: 'Elegant diamond solitaire ring with 18k gold band',
            price: 45000,
            category: 'rings',
            imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            stockQuantity: 10,
            isActive: true,
            isFeatured: true,
          },
          {
            name: 'Pearl Necklace',
            description: 'Classic pearl necklace with sterling silver clasp',
            price: 25000,
            category: 'necklaces',
            imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            stockQuantity: 15,
            isActive: true,
            isFeatured: true,
          },
          {
            name: 'Gold Hoop Earrings',
            description: 'Stylish gold hoop earrings for everyday wear',
            price: 15000,
            category: 'earrings',
            imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            stockQuantity: 20,
            isActive: true,
            isFeatured: false,
          },
          {
            name: 'Tennis Bracelet',
            description: 'Sparkling tennis bracelet with cubic zirconia',
            price: 35000,
            category: 'bracelets',
            imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            stockQuantity: 8,
            isActive: true,
            isFeatured: true,
          },
        ];

        await Product.insertMany(sampleProducts);
        console.log('Sample products created successfully');
      }

    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
}