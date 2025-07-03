
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import FeaturedProducts from '@/components/FeaturedProducts';
import Refurbish from '@/components/Refurbish';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for initial data and components
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading message="Welcome to Zaffira..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen animate-fade-in">
        <Navigation />
        <Hero />
        <About />
        <FeaturedProducts />
        <Refurbish />
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
