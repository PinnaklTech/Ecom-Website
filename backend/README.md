# Zaffira Jewelry Store - Backend API

A robust Node.js/Express backend API for the Zaffira jewelry e-commerce platform with MongoDB integration.

## Features

- **Authentication & Authorization**: JWT-based auth with admin roles
- **Product Management**: CRUD operations for jewelry products
- **Appointment System**: Booking and management system
- **User Management**: User profiles and admin controls
- **Security**: Rate limiting, CORS, input validation, password hashing
- **Database**: MongoDB with Mongoose ODM
- **Auto-initialization**: Creates admin user and sample data on startup

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
cd backend
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

4. **Run the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Seed database only
npm run seed
```

The server will start on `http://localhost:5000` and automatically:
- Connect to MongoDB
- Create admin user (admin@zaffira.com / admin123)
- Seed sample products if none exist

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/admin` - Toggle admin status (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PUT /api/products/:id/stock` - Update stock (admin)
- `GET /api/products/categories/list` - Get categories

### Appointments
- `GET /api/appointments` - Get all appointments (admin)
- `GET /api/appointments/user/:userId` - Get user appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/status` - Update status (admin)
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/stats/overview` - Get statistics (admin)

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/zaffira-jewelry

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:8080

# Admin User
ADMIN_EMAIL=admin@zaffira.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

## Database Schema

### Users
- Email, password (bcrypt hashed)
- Name, username, phone
- Admin flag, active status
- Timestamps

### Products
- Name, description, price
- Category, image URL
- Stock quantity, active/featured flags
- Material, weight, dimensions
- Auto-generated SKU

### Appointments
- User reference, appointment date
- Customer details (name, email, phone)
- Cart items, total amount
- Status, notes, admin notes
- Timestamps

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse
- **Input Validation**: express-validator
- **CORS Protection**: Configurable origins
- **Helmet**: Security headers
- **Error Handling**: Centralized error management

## Development

### Project Structure
```
backend/
├── models/           # Mongoose schemas
├── routes/           # Express route handlers
├── middleware/       # Custom middleware
├── scripts/          # Utility scripts
├── .env             # Environment variables
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features

1. **Create Model**: Add Mongoose schema in `models/`
2. **Add Routes**: Create route handlers in `routes/`
3. **Add Middleware**: Custom middleware in `middleware/`
4. **Update Server**: Register routes in `server.js`

### Testing

```bash
# Health check
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@zaffira.com","password":"admin123"}'
```

## Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production MongoDB URI
   - Set up proper CORS origins

2. **Security Checklist:**
   - Change default admin credentials
   - Use HTTPS
   - Set up proper firewall rules
   - Enable MongoDB authentication
   - Use environment variables for secrets

3. **Monitoring:**
   - Set up logging
   - Monitor database performance
   - Track API usage
   - Set up health checks

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed:**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **Authentication Errors:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure user exists and is active

3. **CORS Issues:**
   - Check FRONTEND_URL setting
   - Verify allowed origins
   - Check request headers

### Logs

The server provides detailed logging:
- Startup information
- Database connection status
- API request logs (development)
- Error details

## Support

For issues and questions:
1. Check the logs for error details
2. Verify environment configuration
3. Test with provided curl examples
4. Check MongoDB connection and data

## License

This project is proprietary software. All rights reserved.