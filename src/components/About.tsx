
import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-navy mb-4 sm:mb-6 leading-tight">
                About Zaffira
              </h2>
              <div className="w-20 sm:w-24 h-1 bg-gold mb-6 sm:mb-8"></div>
            </div>
            
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              For over three decades, Zaffira has been synonymous with exceptional craftsmanship and timeless elegance. Our master artisans pour their passion into every piece, creating jewelry that transcends trends and becomes treasured heirlooms.
            </p>
            
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Each piece in our collection tells a story of dedication, precision, and artistry. From selecting the finest materials to the final polish, we ensure that every detail meets our exacting standards of perfection.
            </p>
            
            <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gold mb-2">30+</div>
                <div className="text-sm sm:text-base text-gray-600">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gold mb-2">10K+</div>
                <div className="text-sm sm:text-base text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gold mb-2">500+</div>
                <div className="text-sm sm:text-base text-gray-600">Unique Designs</div>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Jewelry craftsmanship"
                className="w-full h-72 sm:h-80 lg:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-gold/20">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-navy mb-1">Master Crafted</div>
                <div className="text-xs sm:text-sm text-gray-600">Since 1993</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
