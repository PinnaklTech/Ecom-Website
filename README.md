# Zaffira Jewelry Store

A modern jewelry e-commerce application built with React, TypeScript, and Tailwind CSS.

## Architecture

This application follows a client-server architecture:

- **Frontend**: React application (this repository)
- **Backend**: Node.js/Express API server (separate repository required)

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

## Backend Requirements

The frontend expects a REST API backend with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### Users
- `GET /api/users/:id` - Get user by ID

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Appointments
- `GET /api/appointments` - Get all appointments (admin only)
- `GET /api/appointments/user/:userId` - Get user appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/status` - Update appointment status

## Environment Variables

- `VITE_API_URL` - Backend API base URL

## Features

- User authentication and authorization
- Product catalog with filtering and search
- Shopping cart functionality
- Appointment booking system
- Admin panel for product and appointment management
- Responsive design
- Modern UI with Tailwind CSS

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query (TanStack Query)
- Radix UI components
- Lucide React icons

## Development

The application uses Vite for fast development and building. Hot module replacement is enabled for a smooth development experience.

## Deployment

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Note

This frontend application requires a separate backend API server to function properly. Make sure to set up the backend with the required endpoints and update the `VITE_API_URL` environment variable accordingly.