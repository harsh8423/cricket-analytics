import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react';
import {Lightbulb, MessagesSquare, Star, Users, MapPin, GitCompare, Trophy, Swords, Brain, MessageCircle} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// Sidebar Component
export default function Sidebar({ collapsed, setCollapsed, activePage, setActivePage }){
  const navigate = useNavigate();
  const { teamname, match_id } = useParams();
  const [team1_name, setteam1_name] = useState(null)
  const [team2_name, setteam2_name] = useState(null)
  
  useEffect(() => {
    const extractTeams = (teamInfo) => {
      if (!teamInfo) return { team1: "", team2: "" };
      
      const teams = teamInfo.split("vs");
      const team1 = teams[0]?.replace(/%20/g, " ").trim();
      const team2 = teams[1]?.replace(/%20/g, " ").trim();
      
      setteam1_name(team1);
      setteam2_name(team2);
    };
    extractTeams(teamname);
  }, [teamname]);

  const location = useLocation();

  // Handle navigation and state update
  const handleNavigation = (page) => {
    setActivePage(page);
    navigate(`/dashboard/${match_id}/${team1_name}vs${team2_name}/${page}`);
  };

  // Set active page based on location or state
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/fantasy')) {
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
    <div className={`bg-indigo-600 text-white h-screen transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
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
        <SidebarItem
          icon={<Brain />}
          text="AI Fantasy Team"
          collapsed={collapsed}
          active={activePage === 'fantasy'}
          onClick={() => handleNavigation('fantasy')}
        />
        <SidebarItem
          icon={<MessageCircle />}
          text="Chat Assistant"
          collapsed={collapsed}
          active={activePage === 'chat'}
          onClick={() => handleNavigation('chat')}
        />
        <SidebarItem
          icon={<Lightbulb />}
          text="Quick Key Insights"
          collapsed={collapsed}
          active={activePage === 'KeyInsights'}
          onClick={() => handleNavigation('KeyInsights')}
        />
        <SidebarItem
          icon={<MapPin />}
          text="Venue/Pitch Report"
          collapsed={collapsed}
          active={activePage === 'VenueStats'}
          onClick={() => handleNavigation('VenueStats')}
        />
        <SidebarItem
          icon={<Users />}
          text={team1_name}
          collapsed={collapsed}
          active={activePage === 'team1'}
          onClick={() => handleNavigation('team1')}
        />
        <SidebarItem
          icon={<Users />}
          text={team2_name}
          collapsed={collapsed}
          active={activePage === 'team2'}
          onClick={() => handleNavigation('team2')}
        />
        <SidebarItem
          icon={<GitCompare />}
          text="Team H2H"
          collapsed={collapsed}
          active={activePage === 'TeamH2H'}
          onClick={() => handleNavigation('TeamH2H')}
        />
        <SidebarItem
          icon={<Star />}
          text="Player Ratings"
          collapsed={collapsed}
          active={activePage === 'PlayerRatings'}
          onClick={() => handleNavigation('PlayerRatings')}
        />
        <SidebarItem
          icon={<Swords />}
          text="Compare"
          collapsed={collapsed}
          active={activePage === 'compare'}
          onClick={() => handleNavigation('compare')}
        />
        <SidebarItem
          icon={<Trophy />}
          text="Expert Prediction"
          collapsed={collapsed}
          active={activePage === 'expertPrediction'}
          onClick={() => handleNavigation('expertPrediction')}
        />
        <SidebarItem
          icon={<MessagesSquare />}
          text="Discussion Forum"
          collapsed={collapsed}
          active={activePage === 'discussion'}
          onClick={() => handleNavigation('discussion')}
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
