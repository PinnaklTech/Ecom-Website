
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-6xl font-playfair font-bold text-navy mb-4">404</h1>
            <h2 className="text-3xl font-playfair font-semibold text-navy mb-6">Page Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
              <Button className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8 py-3">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
