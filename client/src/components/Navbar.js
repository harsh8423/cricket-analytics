import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Book, 
  Phone, 
  Star, 
  Crown 
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 backdrop-blur-lg bg-gradient-to-b from-white/90 to-white/50 border-b border-white/20 z-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 group hover:scale-105 transition-transform">
            <Link to="/" className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                CricGenius
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {/* Always Visible Links */}

            <div className="relative group">
              <Link 
                to="/blog" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-medium hidden md:inline-block">Blogs</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </div>

            <div className="relative group">
              <Link 
                to="/contact" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-medium hidden md:inline-block">Contact Us</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </div>

            <div className="relative group">
              <Link 
                to="/features" 
                className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-medium hidden md:inline-block">Features</span>
              </Link>
              <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
            </div>

            {/* Authentication-based Links */}
            {isAuthenticated ? (
              <>
                  {!user?.isPro && (
                    <div className="relative group">
                      <Link 
                        to="/upgrade" 
                        className="p-2 rounded-full flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                      >
                        <Crown className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:inline-block">Upgrade Pro</span>
                      </Link>
                      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-yellow-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
                    </div>
                  )}
                <div className="relative group">
                  <Link 
                    to="/profile" 
                    className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:inline-block">Profile</span>
                  </Link>
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
                </div>


              
                <div className="relative group">
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-full flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:inline-block">Sign Out</span>
                  </button>
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
                </div>
              </>
            ) : (
              <div className="relative group">
                <Link 
                  to="/login" 
                  className="p-2 rounded-full flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden md:inline-block">Sign In</span>
                </Link>
                <div className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300 -translate-x-1/2"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;