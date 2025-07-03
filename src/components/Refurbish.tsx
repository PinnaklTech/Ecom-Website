import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Refurbish = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const beforeAfterImages = [
    {
      id: 1,
      before: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Vintage Ring Restoration",
      description: "Transformed a worn family heirloom into a stunning modern piece"
    },
    {
      id: 2,
      before: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Necklace Redesign",
      description: "Reimagined an old necklace with contemporary styling"
    },
    {
      id: 3,
      before: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1635767582909-345fa88ada70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Earring Transformation",
      description: "Updated classic earrings with modern diamond settings"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + beforeAfterImages.length) % beforeAfterImages.length);
  };

  const handleBookConsultation = () => {
    navigate('/book-consultation');
  };

  return (
    <section id="refurbish" className="py-20 bg-gradient-to-br from-ivory to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy mb-4">
            Refurbish Your Treasures
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Give new life to your cherished jewelry pieces. Our master craftsmen specialize in restoration, 
            redesign, and modernization while preserving the sentimental value of your treasures.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before/After Gallery */}
          <div className="relative">
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative">
                <div className="grid grid-cols-2">
                  {/* Before */}
                  <div className="relative">
                    <img
                      src={beforeAfterImages[currentSlide].before}
                      alt="Before refurbishment"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Before
                    </div>
                  </div>
                  
                  {/* After */}
                  <div className="relative">
                    <img
                      src={beforeAfterImages[currentSlide].after}
                      alt="After refurbishment"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      After
                    </div>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-playfair font-semibold text-navy mb-2">
                  {beforeAfterImages[currentSlide].title}
                </h3>
                <p className="text-gray-600">
                  {beforeAfterImages[currentSlide].description}
                </p>
              </CardContent>
            </Card>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {beforeAfterImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-gold' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-playfair font-bold text-navy mb-4">
                Transform Your Legacy
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Whether it's a family heirloom that needs restoration or a piece you'd like to modernize, 
                our expert craftsmen can breathe new life into your jewelry while maintaining its emotional significance.
              </p>
            </div>

            {/* Services List */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-navy">Restoration</h4>
                  <p className="text-gray-600">Bring back the original beauty of vintage pieces</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-navy">Redesign</h4>
                  <p className="text-gray-600">Transform outdated styles into contemporary masterpieces</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-navy">Stone Setting</h4>
                  <p className="text-gray-600">Secure loose stones or add new ones for enhanced beauty</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-navy">Resizing & Repair</h4>
                  <p className="text-gray-600">Perfect fit and structural integrity restoration</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Button 
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8 py-4 mb-4"
                onClick={handleBookConsultation}
              >
                Book Free Consultation
              </Button>
              <p className="text-sm text-gray-600">
                Get a free estimate and consultation with our master jewelers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Refurbish;
