import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, ShieldCheck, Home as HomeIcon, User, Search } from 'lucide-react';

function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  // On non-home pages, we force the "scrolled" (dark) look so it's visible against white backgrounds
  const isDarkActive = scrolled || !isHomePage;

  const floatBg = isDarkActive
    ? 'bg-[#0d1b2a]/95 backdrop-blur-xl shadow-2xl shadow-black/30'
    : 'bg-white/10 backdrop-blur-md shadow-lg shadow-black/10';

  const textColor = 'text-white';
  const hoverColor = 'hover:text-teal-300';
  const logoGradient = 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-200';
  const iconColor = 'text-teal-400';

  const searchBg = isDarkActive
    ? 'bg-white/10 border-white/20 placeholder-white/40 text-white focus:bg-white/15'
    : 'bg-white/15 border-white/25 placeholder-white/50 text-white focus:bg-white/25';

  return (
    /* Outer wrapper — fixed, full width, provides the top padding for floating effect */
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none">
      <nav
        className={`pointer-events-auto rounded-2xl transition-all duration-300 mx-auto max-w-6xl ${floatBg}`}
      >
        <div className="px-5 py-3 flex flex-wrap justify-between items-center gap-3">

          {/* Logo */}
          <Link
            to="/"
            className={`text-xl font-extrabold flex items-center gap-2 transition transform hover:scale-105 flex-shrink-0 ${logoGradient}`}
          >
            <ShoppingCart className={iconColor} size={26} />
            <span>EcomStore</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-md">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className={`w-full pl-4 pr-10 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-400/60 transition-all text-sm ${searchBg}`}
              />
              <button
                type="submit"
                className="absolute right-3 text-white/60 hover:text-teal-300 transition-colors"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div className={`flex items-center space-x-4 font-medium flex-shrink-0 text-sm ${textColor}`}>
            <Link to="/" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
              <HomeIcon size={16} /> Home
            </Link>

            {token ? (
              <>
                {role !== 'admin' && (
                  <Link to="/profile" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
                    <User size={16} /> Profile
                  </Link>
                )}
                {role === 'admin' && (
                  <Link to="/admin" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`flex items-center gap-1 transition-colors ${hoverColor}`}>
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}

export default Navbar;
