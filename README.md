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

2. Environment variables are already configured in `.env` file to work with the backend on port 5000.

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080` and proxy API calls to `http://localhost:5000`.

## Current Status

⚠️ **Backend Required**: The frontend is now properly configured but requires a backend API server to function. Without the backend:

- The app will load but show empty product lists
- Authentication will not work
- Appointments cannot be created
- Admin panel will be empty

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

- `VITE_API_URL` - Backend API base URL (defaults to `/api` for proxy)

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

## Error Handling

The frontend now gracefully handles backend connection errors:
- Shows empty states when backend is unavailable
- Displays user-friendly error messages
- Prevents app crashes from API failures

## Deployment

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Next Steps

To get the full application working:

1. Create a Node.js/Express backend server
2. Implement the required API endpoints
3. Set up MongoDB database
4. Configure authentication with JWT
5. Start the backend server on port 5000

The frontend is now ready and will automatically connect to the backend once it's available.