const User = require('../models/User');
const Product = require('../models/Product');

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zaffira.com';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'User',
        username: 'admin',
        isAdmin: true
      });
      
      await adminUser.save();
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Seed products if none exist
const seedProducts = async () => {
  try {
    const productCount = await Product.countDocuments();
    
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Diamond Solitaire Ring',
          description: 'Elegant diamond solitaire ring with 18k white gold band. Perfect for engagements and special occasions.',
          price: 45000,
          category: 'rings',
          imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 5,
          isActive: true,
          isFeatured: true,
          material: '18k White Gold',
          weight: 3.5
        },
        {
          name: 'Pearl Drop Earrings',
          description: 'Classic pearl drop earrings with sterling silver hooks. Timeless elegance for any occasion.',
          price: 8500,
          category: 'earrings',
          imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 12,
          isActive: true,
          isFeatured: true,
          material: 'Sterling Silver',
          weight: 2.1
        },
        {
          name: 'Gold Chain Necklace',
          description: 'Beautiful 22k gold chain necklace with intricate design. Perfect for daily wear or special occasions.',
          price: 32000,
          category: 'necklaces',
          imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 8,
          isActive: true,
          isFeatured: true,
          material: '22k Gold',
          weight: 15.2
        },
        {
          name: 'Tennis Bracelet',
          description: 'Stunning tennis bracelet with cubic zirconia stones. Elegant and sophisticated design.',
          price: 15000,
          category: 'bracelets',
          imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 6,
          isActive: true,
          isFeatured: false,
          material: 'Sterling Silver',
          weight: 8.7
        },
        {
          name: 'Heart Pendant',
          description: 'Delicate heart-shaped pendant with rose gold chain. Symbol of love and affection.',
          price: 12000,
          category: 'pendants',
          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 10,
          isActive: true,
          isFeatured: false,
          material: 'Rose Gold',
          weight: 4.3
        },
        {
          name: 'Luxury Watch',
          description: 'Premium luxury watch with leather strap and gold-plated case. Perfect blend of style and functionality.',
          price: 75000,
          category: 'watches',
          imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 3,
          isActive: true,
          isFeatured: true,
          material: 'Gold Plated',
          weight: 120.5
        },
        {
          name: 'Silver Chain',
          description: 'Classic silver chain with modern design. Versatile piece that complements any outfit.',
          price: 5500,
          category: 'chains',
          imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 15,
          isActive: true,
          isFeatured: false,
          material: 'Sterling Silver',
          weight: 12.8
        },
        {
          name: 'Jewelry Box',
          description: 'Elegant wooden jewelry box with velvet interior. Perfect for storing and organizing your precious jewelry.',
          price: 3500,
          category: 'accessories',
          imageUrl: 'https://images.unsplash.com/photo-1506629905607-c60f6c3e7db1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          stockQuantity: 20,
          isActive: true,
          isFeatured: false,
          material: 'Wood',
          weight: 500.0
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log(`✅ ${sampleProducts.length} sample products created`);
    } else {
      console.log(`ℹ️  Products already exist (${productCount} products found)`);
    }
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
};

module.exports = {
  createAdminUser,
  seedProducts
};