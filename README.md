
# Zaffira - Luxury Jewelry Store

A modern, responsive e-commerce platform for luxury jewelry, built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Catalog**: Browse our exquisite collection of handcrafted jewelry
- **User Authentication**: Secure login and registration system
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
- **Backend**: Supabase (Database, Authentication, Storage)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

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
Create a `.env.local` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

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
├── integrations/       # External service integrations
├── lib/               # Utility functions
├── pages/             # Route components
├── types/             # TypeScript type definitions
└── index.css          # Global styles
```

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
