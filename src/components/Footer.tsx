
import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-navy text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-gold mb-4 sm:mb-6">Zaffira</h3>
            <p className="text-gray-300 leading-relaxed text-base">
              Crafting timeless jewelry pieces that celebrate life's most precious moments. 
              Experience the art of fine jewelry with Zaffira.
            </p>
            <div className="flex space-x-6 pt-4">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-gold mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Home</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">About Us</a></li>
              <li><a href="#products" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Products</a></li>
              <li><a href="#refurbish" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Refurbish</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-gold mb-4 sm:mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Custom Design</a></li>
              <li><a href="#" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Jewelry Repair</a></li>
              <li><a href="#" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Appraisals</a></li>
              <li><a href="#" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Ring Resizing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">Cleaning & Care</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-gold mb-4 sm:mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-base">Telangana State</p>
                  <p className="text-gray-300 text-base">Hyderabad, Secunderabad</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">
                  +91 0000000000
                </a>
              </div>
              
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="mailto:info@zaffira.com" className="text-gray-300 hover:text-gold transition-colors duration-300 text-base">
                  info@zaffira.com
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-8">
              <h5 className="text-base font-semibold text-gold mb-3">Business Hours</h5>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Mon - Fri: 10am - 7pm</p>
                <p>Saturday: 10am - 6pm</p>
                <p>Sunday: 12pm - 5pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} Zaffira Jewelry. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">Return Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
