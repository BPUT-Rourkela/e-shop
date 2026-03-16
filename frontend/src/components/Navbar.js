import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, ShieldCheck, Home as HomeIcon, User, Search } from 'lucide-react';

function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', syncAuth);
    window.addEventListener('authChange', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authChange', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('authChange'));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-200 flex items-center gap-2 transition transform hover:scale-105 flex-shrink-0">
          <ShoppingCart className="text-teal-400" size={30} />
          <span>EcomStore</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-grow max-w-xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-5 pr-12 py-2.5 rounded-full bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white/20 transition-all backdrop-blur-sm"
            />
            <button
              type="submit"
              className="absolute right-3 text-white/70 hover:text-teal-300 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Nav Links */}
        <div className="flex items-center space-x-5 text-white font-medium flex-shrink-0">
          <Link to="/" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
            <HomeIcon size={18} /> Home
          </Link>

          {token ? (
            <>
              {/* Profile: only for customers */}
              {role !== 'admin' && (
                <Link to="/profile" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
                  <User size={18} /> Profile
                </Link>
              )}
              {role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
                  <ShieldCheck size={18} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 hover:text-red-400 transition-colors">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-teal-300 transition-colors">
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
