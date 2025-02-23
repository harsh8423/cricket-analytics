import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Menu as MenuIcon
} from 'lucide-react';
import {Lightbulb,Plus, X, MessageSquare, MessagesSquare, Star, Users, MapPin, GitCompare, Trophy, Swords, HomeIcon, Brain} from 'lucide-react';

import { useLocation } from 'react-router-dom';

// Sidebar Component
export default function Sidebar({ collapsed, setCollapsed, activePage, setActivePage }){
  const location = useLocation();
  const playerCategories = ['Squad','Batters', 'Bowlers', 'All Rounders', 'Wicket Keeper'];

  // Set active page based on location or state
  useEffect(() => {
    // Extract the active page from the URL path
    const path = location.pathname;
    if (path.includes('/fantasy') || location.state?.editData) {
      setActivePage('fantasy');
    } else if (path.includes('/KeyInsights')) {
      setActivePage('KeyInsights');
    } else if (path.includes('/VenueStats')) {
      setActivePage('VenueStats');
    } else if (path.includes('/team1')) {
      setActivePage('team1');
    } else if (path.includes('/team2')) {
      setActivePage('team2');
    } else if (path.includes('/TeamH2H')) {
      setActivePage('TeamH2H');
    } else if (path.includes('/PlayerRatings')) {
      setActivePage('PlayerRatings');
    } else if (path.includes('/compare')) {
      setActivePage('compare');
    } else if (path.includes('/expertPrediction')) {
      setActivePage('expertPrediction');
    } else if (path.includes('/discussion')) {
      setActivePage('discussion');
    }
  }, [location, setActivePage]);

  return (
    <div 
      className={`bg-indigo-600 text-white h-screen transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-indigo-500">
        <h2 className={`font-bold ${collapsed ? 'hidden' : 'block'}`}>
          Cricket Analytics
        </h2>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-indigo-700 rounded"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="mt-4">
        {/* AI Fantasy Team */}
        <SidebarItem
          icon={<Brain />}
          text="AI Fantasy Team"
          collapsed={collapsed}
          active={activePage === 'fantasy'}
          onClick={() => setActivePage('fantasy')}
        />
        <SidebarItem
          icon={<Lightbulb />}
          text="Quick Key Insights"
          collapsed={collapsed}
          active={activePage === 'KeyInsights'}
          onClick={() => setActivePage('KeyInsights')}
        />
        <SidebarItem
          icon={<MapPin />}
          text="Venue/Pitch Report"
          collapsed={collapsed}
          active={activePage === 'VenueStats'}
          onClick={() => setActivePage('VenueStats')}
        />
        {/* Team 1 */}
        <div>
          <SidebarItem
            icon={<Users />}
            text="Team 1"
            collapsed={collapsed}
            active={activePage===('team1')}
            onClick={() => setActivePage('team1')}
          />
        </div>
        <div>
          <SidebarItem
            icon={<Users />}
            text="Team 2"
            collapsed={collapsed}
            active={activePage===('team2')}
            onClick={() => setActivePage('team2')}
          />
        </div>
        <SidebarItem
          icon={<GitCompare />}
          text="Team H2H"
          collapsed={collapsed}
          active={activePage === 'TeamH2H'}
          onClick={() => setActivePage('TeamH2H')}
        />
        <SidebarItem
          icon={<Star />}
          text="Player Ratings"
          collapsed={collapsed}
          active={activePage === 'PlayerRatings'}
          onClick={() => setActivePage('PlayerRatings')}
        />
        {/* Compare */}
        <SidebarItem
          icon={<Swords />}
          text="Compare"
          collapsed={collapsed}
          active={activePage === 'compare'}
          onClick={() => setActivePage('compare')}
        />
        {/* prediction */}
        <SidebarItem
          icon={<Trophy />}
          text="Expert Prediction"
          collapsed={collapsed}
          active={activePage === 'expertPrediction'}
          onClick={() => setActivePage('expertPrediction')}
        />

        {/* Community and Discussion */}
        <SidebarItem
          icon={<MessagesSquare />}
          text="Discussion Forum"
          collapsed={collapsed}
          active={activePage === 'discussion'}
          onClick={() => setActivePage('discussion')}
        />
      </nav>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ 
  icon, 
  text, 
  collapsed, 
  active, 
  onClick, 
  hasDropdown, 
  isOpen 
}) => (
  <div
  className={`
  flex items-center px-4 py-3 cursor-pointer
  ${active ? 'bg-indigo-700' : 'hover:bg-indigo-700'}
  `}
    onClick={onClick}
  >
    <span className="w-6 h-6">{icon}</span>
    {!collapsed && (
      <>
        <span className="ml-3 flex-1">{text}</span>
        {hasDropdown && (
          <span className="w-6 h-6">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        )}
      </>
    )}
  </div>
);
