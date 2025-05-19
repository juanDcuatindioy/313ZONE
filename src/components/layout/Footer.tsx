import React from 'react';
import { GlassWater, Instagram, Facebook, Twitter } from 'lucide-react';
import { APP_NAME } from '../../config';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <GlassWater className="h-6 w-6 text-purple-500 mr-2" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </div>
          
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
          
          <div className="text-sm text-gray-400">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;