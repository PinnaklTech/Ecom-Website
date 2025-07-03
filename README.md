# Zaffira - Luxury Jewelry Store

A modern, responsive e-commerce platform for luxury jewelry, built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Catalog**: Browse our exquisite collection of handcrafted jewelry
- **User Authentication**: Custom authentication system with JWT tokens
- **Shopping Cart**: Add items and manage your selections
- **Appointment Booking**: Schedule consultations and custom jewelry appointments
- **Admin Panel**: Manage products, orders, and customer appointments
- **Responsive Design**: Optimized for all devices and screen sizes
- **SEO Optimized**: Built with search engine optimization best practices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **Routing**: React Router DOM
- **State Management**: React Context + React Query
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom JWT-based authentication with bcryptjs
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zaffira-jewelry
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your MongoDB credentials:
```
MONGODB_URI=mongodb://localhost:27017/zaffira-jewelry
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
VITE_APP_NAME=Zaffira
VITE_API_URL=http://localhost:8080/api
```

4. Start MongoDB:
Make sure your MongoDB instance is running locally or update the connection string for your cloud database.

5. Start the development server:
```bash
npm run dev
```

The application will automatically:
- Connect to MongoDB
- Create an admin user (admin@zaffira.com / admin123)
- Seed sample products

## Build for Production

```bash
npm run build
```

The optimized production build will be created in the `dist` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/               # Utility functions and MongoDB connection
├── models/            # Mongoose schemas
├── pages/             # Route components
├── services/          # Database service layer
├── types/             # TypeScript type definitions
└── index.css          # Global styles
```

## Database Schema

### Users
- Email, password (hashed with bcryptjs)
- First name, last name, username
- Admin flag
- Phone number

### Products
- Name, description, price
- Category, image URL
- Stock quantity
- Active/featured flags

### Appointments
- User reference
- Appointment date/time
- Customer details
- Cart items (embedded)
- Status and notes

## Authentication

The application uses a custom JWT-based authentication system:

- **Sign Up**: Creates new user with hashed password
- **Sign In**: Validates credentials and returns JWT token
- **Admin Access**: Special admin login with role verification
- **Token Storage**: JWT tokens stored in localStorage
- **Auto-refresh**: Tokens verified on app initialization

## Admin Features

Default admin credentials:
- Email: admin@zaffira.com
- Password: admin123

Admin users can:
- Manage products (create, update, delete)
- View all appointments
- Update appointment status
- Access admin dashboard

## API Integration

The application includes integration points for external services:
- Email notifications via backend API
- Product image management
- Appointment confirmation system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Contact

For support or inquiries, please contact us through our website.