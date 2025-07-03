import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 43, 76, 0.4), rgba(26, 43, 76, 0.4)), url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
          Exquisite
          <span className="block text-gold">Jewelry</span>
          Crafted with Love
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto animate-fade-in px-2"
          style={{ animationDelay: "0.2s" }}
        >
          Discover our collection of handcrafted jewelry pieces that tell your
          unique story
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center items-center animate-fade-in px-4"
          style={{ animationDelay: "0.4s" }}
        >
          <Link to="/products" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] transition-all duration-300 transform hover:scale-105"
            >
              Browse Collection
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-white text-navy hover:bg-white hover:text-gold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Our Story
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
