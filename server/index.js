const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://giridhar6750:giridhar6750@cluster0.mongodb.net/zaffira-jewelry?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  seedInitialData();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  phone: { type: String, trim: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'chains', 'watches', 'accessories']
  },
  imageUrl: { type: String, trim: true },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  cartItems: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username: username || null }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      isAdmin: false
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      isAdmin: user.isAdmin
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      isAdmin: user.isAdmin
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error during signin' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const userResponse = {
    _id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    username: req.user.username,
    phone: req.user.phone,
    isAdmin: req.user.isAdmin
  };
  res.json(userResponse);
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, isActive, isFeatured, minPrice, maxPrice } = req.query;
    
    let filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Appointment Routes
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      userId: req.user._id
    };
    
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error creating appointment' });
  }
});

app.get('/api/appointments/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Users can only view their own appointments, admins can view any
    if (req.params.userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = await Appointment.find({ userId: req.params.userId })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const appointments = await Appointment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

app.put('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
});

// User Routes
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Users can only view their own profile, admins can view any
    if (req.params.id !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Seed initial data
async function seedInitialData() {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@zaffira.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        email: 'admin@zaffira.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created: admin@zaffira.com / admin123');
    }

    // Check if products exist
    const productCount = await Product.countDocuments();
    
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Diamond Engagement Ring',
          description: 'Elegant solitaire diamond ring with platinum band',
          price: 45000,
          category: 'rings',
          imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 5,
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Gold Pearl Necklace',
          description: 'Classic pearl necklace with 18k gold clasp',
          price: 25000,
          category: 'necklaces',
          imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 8,
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Sapphire Stud Earrings',
          description: 'Beautiful blue sapphire earrings in white gold setting',
          price: 18000,
          category: 'earrings',
          imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 12,
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Tennis Bracelet',
          description: 'Sparkling diamond tennis bracelet',
          price: 35000,
          category: 'bracelets',
          imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 6,
          isActive: true,
          isFeatured: false
        },
        {
          name: 'Ruby Pendant',
          description: 'Stunning ruby pendant with diamond accents',
          price: 22000,
          category: 'pendants',
          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 10,
          isActive: true,
          isFeatured: false
        },
        {
          name: 'Gold Chain Necklace',
          description: 'Classic 18k gold chain necklace',
          price: 15000,
          category: 'chains',
          imageUrl: 'https://images.unsplash.com/photo-1635767582909-345fa88ada70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 15,
          isActive: true,
          isFeatured: false
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products created');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Zaffira API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});