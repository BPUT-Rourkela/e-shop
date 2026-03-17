import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, ShieldCheck, Home as HomeIcon, User, Search } from 'lucide-react';

function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Auth sync
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

  // Scroll listener — transition navbar when user scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  // Scroll-aware styles
  const navBg = scrolled
    ? 'bg-[#0d1b2a]/90 backdrop-blur-md shadow-lg'
    : 'bg-white shadow-sm';
  const textColor = scrolled ? 'text-white' : 'text-gray-800';
  const hoverColor = scrolled ? 'hover:text-teal-300' : 'hover:text-indigo-600';
  const logoColor = scrolled
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-200'
    : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-400';
  const iconColor = scrolled ? 'text-teal-400' : 'text-indigo-600';
  const searchBg = scrolled
    ? 'bg-white/10 border-white/20 placeholder-white/50 text-white focus:bg-white/20'
    : 'bg-gray-100 border-gray-200 placeholder-gray-400 text-gray-800 focus:bg-white';
  const searchIconColor = scrolled ? 'text-white/70 hover:text-teal-300' : 'text-gray-500 hover:text-indigo-600';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className={`text-2xl font-extrabold flex items-center gap-2 transition transform hover:scale-105 flex-shrink-0 ${logoColor}`}>
          <ShoppingCart className={iconColor} size={30} />
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
              className={`w-full pl-5 pr-12 py-2.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all backdrop-blur-sm ${searchBg}`}
            />
            <button
              type="submit"
              className={`absolute right-3 transition-colors ${searchIconColor}`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Nav Links */}
        <div className={`flex items-center space-x-5 font-medium flex-shrink-0 ${textColor}`}>
          <Link to="/" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
            <HomeIcon size={18} /> Home
          </Link>

          {token ? (
            <>
              {/* Profile: only for customers */}
              {role !== 'admin' && (
                <Link to="/profile" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
                  <User size={18} /> Profile
                </Link>
              )}
              {role === 'admin' && (
                <Link to="/admin" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
                  <ShieldCheck size={18} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className={`flex items-center gap-1 transition-colors ${scrolled ? 'hover:text-red-400' : 'hover:text-red-500'}`}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
