import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogIn, ShieldCheck, Home as HomeIcon } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-200 flex items-center gap-2 transition transform hover:scale-105">
          <ShoppingCart className="text-teal-400" size={30} />
          <span>EcomStore</span>
        </Link>
        
        <div className="flex items-center space-x-6 text-white font-medium">
          <Link to="/" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
            <HomeIcon size={18} /> Home
          </Link>
          <Link to="/login" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
            <LogIn size={18} /> Login
          </Link>
          <Link to="/admin" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
            <ShieldCheck size={18} /> Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
