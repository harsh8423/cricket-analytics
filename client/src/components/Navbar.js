import React from 'react';
import { User } from 'lucide-react';

const Navbar = ({ 
  team1 = "CSK", 
  team2 = "RCB", 
  team1Full = "Chennai Super Kings",
  team2Full = "Royal Challengers Bangalore",
  matchTime = "19:30 IST" 
}) => {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#5851D8] to-[#4A45B2] shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Team Names with Full Names */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
                <span className="text-white font-semibold">{team1Full}</span>
                <span className="text-yellow-300 mx-2 font-bold">vs</span>
                <span className="text-white font-semibold">{team2Full}</span>
              </div>
            </div>

            {/* Match Time */}
            <div className="bg-white/10 rounded-lg px-4 py-1">
              <div className="text-red-400 font-bold animate-pulse">
                {matchTime}
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center">
              <button className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200">
                <User className="h-5 w-5 text-white" />
                <span className="text-white text-sm">Profile</span>
              </button>
            </div>
          </div>

          {/* Mobile View - Simplified */}
          <div className="md:hidden flex items-center justify-between h-16">
            {/* Short Team Names */}
            <div className="flex items-center bg-white/10 rounded-lg px-3 py-1">
              <span className="text-white font-semibold text-sm">{team1}</span>
              <span className="text-yellow-300 mx-1 font-bold text-sm">vs</span>
              <span className="text-white font-semibold text-sm">{team2}</span>
            </div>

            {/* Match Time */}
            <div className="bg-white/10 rounded-lg px-3 py-1">
              <div className="text-red-400 font-bold text-sm animate-pulse">
                {matchTime}
              </div>
            </div>

            {/* Profile Icon */}
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200">
              <User className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;