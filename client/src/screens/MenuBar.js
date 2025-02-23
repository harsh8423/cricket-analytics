import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { useParams } from "react-router-dom";

import {Lightbulb,Plus, X, MessageSquare, MessagesSquare, Star, Users, MapPin, GitCompare, Trophy, Swords, HomeIcon, Brain} from 'lucide-react';
  
  import AIFantasyTeam from "../dashboards/AIFantasyTeam";
  import Compare from "../dashboards/Compare";
  import TeamDetails from "../dashboards/TeamDetails";
  import ChatAssistant from "./ChatAssistant";
  import CommunityDiscussion from "../dashboards/CommunityDiscussion";
  import ExpertPredictions from "../dashboards/ExpertPredictions";
import TeamH2H from '../dashboards/TeamH2H';
import VenueStats from '../dashboards/VenueStats';
import PlayerRatings from '../dashboards/PlayerRatings';
import KeyInsights from '../dashboards/KeyInsights';
import Navbar from '../components/Navbar';


const FloatingActionButton = ({ onActionSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
  
    const handleActionClick = (action) => {
      onActionSelect(action);
      setIsOpen(false);
    };

 
  
    return (
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center 
            transform transition-all duration-300 hover:scale-110 
            ${isOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600'}`}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Plus className="w-8 h-8 text-white" />
          )}
        </button>
  
        {/* Menu Items */}
        <div className={`flex flex-col gap-3 mb-3 absolute bottom-16 right-0 transition-all duration-300 transform
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          
          {/* Prediction Button */}
          <button
            onClick={() => handleActionClick('prediction')}
            className="group flex items-center justify-end gap-2"
          >
            <span className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg 
              transform transition-all duration-200 group-hover:bg-indigo-50">
              Prediction
            </span>
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full shadow-lg
              transform transition-all duration-200 group-hover:scale-110">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </button>
  
          {/* Discussion Button */}
          <button
            onClick={() => handleActionClick('discussion')}
            className="group flex items-center justify-end gap-2"
          >
            <span className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg 
              transform transition-all duration-200 group-hover:bg-indigo-50">
              Discussion
            </span>
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full shadow-lg
              transform transition-all duration-200 group-hover:scale-110">
              <MessagesSquare className="w-6 h-6 text-white" />
            </div>
          </button>
  
          {/* Ask AI Button */}
          <button
            onClick={() => handleActionClick('chat')}
            className="group flex items-center justify-end gap-2"
          >
            <span className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg 
              transform transition-all duration-200 group-hover:bg-indigo-50">
              Ask AI
            </span>
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full shadow-lg
              transform transition-all duration-200 group-hover:scale-110">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>
      </div>
    );
  };
  
  
  
  const BottomNav = ({ activePage, setActivePage }) => {
    return (
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe rounded-t-3xl shadow-lg">
        <div className="flex justify-center items-center h-16 gap-16">
          <NavButton 
            icon={<HomeIcon />} 
            label="Discussion" 
            isActive={activePage === 'discussion'}
            onClick={() => setActivePage('discussion')}
          />
          <div className="relative -mt-8">
            <button 
              onClick={() => setActivePage('fantasy')}
              className={`w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 
                flex items-center justify-center shadow-xl transform transition-all duration-200
                border-8 border-gray-100 hover:scale-105
                ${activePage === 'fantasy' ? 'from-indigo-600 to-indigo-800 shadow-inner' : ''}
                relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black opacity-10 rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="font-semibold text-white text-sm">AI</span>
                <span className="text-white text-xs opacity-90">Fantasy</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
            </button>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"></div>
          </div>
          <NavButton 
            icon={<Swords />} 
            label="Predictions" 
            isActive={activePage === 'expertPrediction'}
            onClick={() => setActivePage('expertPrediction')}
          />
        </div>
      </div>
    );
  };
  
  const NavButton = ({ icon, label, isActive, onClick }) => {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center w-16 transition-colors duration-200"
      >
        <div className={`${isActive ? 'text-indigo-600' : 'text-gray-500'} transform transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <span className={`text-xs mt-1 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
          {label}
        </span>
      </button>
    );
  };
  
  const MenuCard = ({ title, subtitle, icon, onClick, gradient = false, className = "", borderColor = "" }) => {
    // Convert borderColor prop to a style object when not using gradient
    const borderStyle = !gradient && borderColor ? {
      borderLeftColor: borderColor,
      borderLeftWidth: '4px'
    } : {};
  
    const colorSchemes = {
      red: {
        bg: 'bg-red-50/50',
        iconColor: 'text-red-400',
      },
      yellow: {
        bg: 'bg-amber-50/50',
        iconColor: 'text-amber-400',
      },
      green: {
        bg: 'bg-emerald-50/50',
        iconColor: 'text-emerald-400',
      },
      blue: {
        bg: 'bg-blue-50/50',
        iconColor: 'text-blue-400',
      },
    };
  
    // Get color scheme based on borderColor prop
    const getColorScheme = () => {
      if (gradient) {
        return {
          bg: 'bg-red-50/50',
          iconColor: 'text-red-400',
        };
      }
      return colorSchemes[borderColor] || colorSchemes.blue;
    };
  
    const { bg, iconColor } = getColorScheme();
  
    return (
      <button
        onClick={onClick}
        className={`group w-full p-4 rounded-2xl transition-all duration-300
          relative overflow-hidden flex items-stretch
          ${bg} hover:bg-opacity-75
          ${className}`}
      >
        <div className="relative flex flex-row items-center gap-4 w-full">
          {/* Icon container */}
          <div className={`w-10 h-10 flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
  
          {/* Text content */}
          <div className="flex flex-col flex-1 text-left">
            <span className="text-base font-semibold text-gray-900">
              {title}
            </span>
            {subtitle && (
              <span className="text-sm mt-0.5 text-gray-600">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };
  
  // Updated MenuBar.js
  export default function MenuBar (){
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [activePage, setActivePage] = useState('overview');
    const [mobileContent, setMobileContent] = useState(null);
  
    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const { teamname } = useParams();

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
        console.log("team1_name",team1_name, "team2_name", team2_name);
      };
      extractTeams(teamname);
      
    }, [teamname])
    

    // Extract team names from the URL parameter
  
  
    const handleNavigation = (page) => {
      if (isMobile) {
        setActivePage(page);
        // Update mobile content based on page
        setMobileContent(getMobileComponent(page));
      } else {
        navigate(`/dashboard/${team1_name}vs${team2_name}/${page}`, { state: { activePage: page } });
      }
    };
  
    const handleFabAction = (action) => {
      switch (action) {
        case 'chat':
          setActivePage('chat');
          setMobileContent(<ChatAssistant open={true} />);
          break;
        case 'discussion':
          setActivePage('discussion');
          setMobileContent(<CommunityDiscussion />);
          break;
        case 'prediction':
          setActivePage('expertPrediction');
          setMobileContent(<ExpertPredictions />);
          break;
        
        default:
          break;
      }
    };
  
    const getMobileComponent = (page) => {
      switch (page) {
        case 'fantasy':
          return <AIFantasyTeam />;
        case 'chat':
          return <ChatAssistant open={true} />;
        case 'discussion':
          return <CommunityDiscussion />;
        case 'expertPrediction':
          return <ExpertPredictions />;
        case 'team1':
          console.log("team1_name",team1_name);
          return <TeamDetails teamname={team1_name} />;
        case 'team2':
          console.log("team2_name",team2_name);
          return <TeamDetails teamname={team2_name} />;
        case 'compare':
          return <Compare />;
        case 'KeyInsights':
          return <KeyInsights />;
        case 'PlayerRatings':
          return <PlayerRatings />;
        case 'VenueStats':
          return <VenueStats />;
        case 'TeamH2H':
          return <TeamH2H/>;
        
        default:
          return null;
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>
        {/* Main Menu Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
          {!mobileContent && (
            <>
              {/* AI Section */}
              <div className="grid md:grid-cols-2 gap-2 mb-8">
                <MenuCard
                  title="Build AI based Fantasy Team"
                  subtitle= "Create winning teams with AI-powered insights and predictions"
                  icon={<Brain className="w-full h-full" />}
                  onClick={() => handleNavigation('fantasy')}
                  borderColor="red"
                />
                <MenuCard
                  title="Ask Stats to AI"
                  subtitle= "Get any stats quickly with our chatbot assistant"
                  icon={<MessageSquare className="w-full h-full" />}
                  onClick={() => handleNavigation('chat')}
                  borderColor="red"
                />
              </div>


              {/* Main Features Section */}
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-2">
              <MenuCard
                title="Quick Key Insights"
                subtitle= "Match-winning factors and key statistics at a glance"
                icon={<Lightbulb className="w-full h-full" />}
                onClick={() => handleNavigation('KeyInsights')}
                borderColor="yellow"
              />
              <MenuCard
                title="Players Rating"
                subtitle= "Performance-based player ratings and form analysis"
                icon={<Star className="w-full h-full" />}
                onClick={() => handleNavigation('PlayerRatings')}
                borderColor="yellow"
              />
            </div>
  
            {/* Row 2 */}
            <div className="grid md:grid-cols-3 gap-2">
              <MenuCard
                title="Venue/Pitch Report"
                subtitle= "Detailed ground analysis and pitch conditions"
                icon={<MapPin className="w-full h-full" />}
                onClick={() => handleNavigation('VenueStats')}
                borderColor="green"
              />
              <MenuCard
                title={team1_name}
                subtitle= "Stats of each player, recent form, batting order..."
                icon={<Users className="w-full h-full" />}
                onClick={() => handleNavigation('team1')}
                borderColor="green"
              />
              <MenuCard
                title={team2_name}
                subtitle= "Stats of each player, recent form, batting order..."
                icon={<Users className="w-full h-full" />}
                onClick={() => handleNavigation('team2')}
                borderColor="green"
              />
            </div>
  
            {/* Row 3 */}
            <div className="grid md:grid-cols-2 gap-2">
              <MenuCard
                title="Team H2H"
                subtitle= "Head-to-head records and historical performance"
                icon={<GitCompare className="w-full h-full" />}
                onClick={() => handleNavigation('TeamH2H')}
                borderColor="blue"
              />
              <MenuCard
                title="Compare"
                subtitle= "Side-by-side comparison of players"
                icon={<Swords className="w-full h-full" />}
                onClick={() => handleNavigation('compare')}
                borderColor="blue"
              />
            </div>
  
            {/* Premium Features */}
            {!isMobile && <div className="grid md:grid-cols-2 gap-2">
              <MenuCard
                title="Expert Predictions"
                subtitle= "Professional match predictions by cricket experts"
                icon={<Trophy className="w-full h-full" />}
                onClick={() => handleNavigation('expertPrediction')}
                gradient={true}
              />
              <MenuCard
                title="Discussion"
                subtitle= "Join the community discussion and share insights"
                icon={<MessagesSquare className="w-full h-full" />}
                onClick={() => handleNavigation('discussion')}
                gradient={true}
              />
            </div>}
            </div>
            </>
          )}
  
          {/* Mobile Content */}
          {isMobile && mobileContent && (
            <div className="fixed inset-0 bg-white z-10 overflow-auto pb-20">
              <button 
                onClick={() => setMobileContent(null)}
                className="fixed top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
              {mobileContent}
            </div>
          )}
        </div>
  
        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <BottomNav 
              activePage={activePage} 
              setActivePage={(page) => {
                setActivePage(page);
                setMobileContent(getMobileComponent(page));
              }} 
            />
            ///////////////////////////////////////////////////////////////
            {/* <FloatingActionButton onActionSelect={handleFabAction} /> */}
          </>
        )}
      </div>
    );
  };
  
  