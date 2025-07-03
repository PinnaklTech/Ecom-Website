import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import Product, { IProduct } from '@/models/Product';
import Appointment, { IAppointment } from '@/models/Appointment';
import { AuthResponse, AuthUser, CartItem } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export class DatabaseService {
  static async init() {
    await connectToDatabase();
  }

  // Auth Methods
  static async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<AuthResponse> {
    await this.init();
    
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    if (userData.username) {
      const existingUsername = await User.findOne({ username: userData.username });
      if (existingUsername) {
        throw new Error('Username already taken');
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    return {
      user: this.formatUser(user),
      token,
    };
  }

  static async signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
    await this.init();
    
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    return {
      user: this.formatUser(user),
      token,
    };
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    await this.init();
    
    const user = await User.findById(userId);
    return user ? this.formatUser(user) : null;
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return await this.getUserById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  private static formatUser(user: IUser): AuthUser {
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };
  }

  // Product Methods
  static async getProducts(filters?: {
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    await this.init();
    
    const query: any = {};
    
    if (filters?.category) query.category = filters.category;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    if (filters?.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    return await Product.find(query).sort({ createdAt: -1 });
  }

  static async getProductById(productId: string) {
    await this.init();
    return await Product.findById(productId);
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
    await this.init();
    
    const product = new Product(productData);
    return await product.save();
  }

  static async updateProduct(productId: string, updateData: Partial<IProduct>) {
    await this.init();
    
    return await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  static async deleteProduct(productId: string) {
    await this.init();
    
    return await Product.findByIdAndDelete(productId);
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
    await this.init();
    
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  static async getAppointmentsByUserId(userId: string) {
    await this.init();
    
    return await Appointment.find({ userId })
      .sort({ appointmentDate: -1 })
      .populate('userId', 'email firstName lastName');
  }

  static async getAllAppointments() {
    await this.init();
    
    return await Appointment.find()
      .sort({ appointmentDate: -1 })
      .populate('userId', 'email firstName lastName');
  }

  static async updateAppointmentStatus(appointmentId: string, status: string) {
    await this.init();
    
    return await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
  }

  static async getAppointmentById(appointmentId: string) {
    await this.init();
    
    return await Appointment.findById(appointmentId)
      .populate('userId', 'email firstName lastName');
  }

  // Utility Methods
  static async seedInitialData() {
    await this.init();
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        email: 'admin@zaffira.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        isAdmin: true,
      });
      console.log('Admin user created: admin@zaffira.com / admin123');
    }

    // Add sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Diamond Engagement Ring',
          description: 'Beautiful diamond engagement ring with platinum setting',
          price: 45000,
          category: 'rings',
          imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 5,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Gold Chain Necklace',
          description: 'Elegant 18k gold chain necklace',
          price: 25000,
          category: 'necklaces',
          imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 10,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Pearl Earrings',
          description: 'Classic pearl drop earrings',
          price: 8000,
          category: 'earrings',
          imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 15,
          isActive: true,
          isFeatured: true,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products created');
    }
  }
}