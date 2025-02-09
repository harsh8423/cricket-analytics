import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, Menu } from 'lucide-react';
import TopNews from '../components/TopNews';
import axios from 'axios';

const bannerData = [
  {
    title: "AI Fantasy Team Prediction",
    description: "Get winning predictions powered by advanced AI algorithms",
    bgColor: "bg-indigo-600"
  },
  {
    title: "In-depth Match Analytics",
    description: "Comprehensive analysis of every match detail",
    bgColor: "bg-blue-600"
  },
  {
    title: "Community & Discussion",
    description: "Join the cricket community to share insights",
    bgColor: "bg-purple-600"
  },
  {
    title: "Live Match Predictions",
    description: "Real-time predictions with high accuracy",
    bgColor: "bg-violet-600"
  }
];



const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/matches/upcoming');
        const transformedMatches = response.data.map((match) => ({
          id: match._id,
          team1: match.team1.short_name,
          team2: match.team2.short_name,
          team1_name: match.team1.team_name,
          team2_name: match.team2.team_name,
          league: match.seriesDesc || 'IPL',
          venue: `${match.venue.name}, ${match.venue.city}`,
          startTime: new Date(match.matchStartTimestamp).toISOString(),
        }));
        setUpcomingMatches(transformedMatches);
      } catch (err) {
        console.error('Error fetching matches:', err);
      }
    };

    fetchMatches();
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMatchAction = (action) => {
    console.log(`Navigating to dashboard with action: ${action}`);
    navigate(`/menubar/${action.team1_name}vs${action.team2_name}/${action.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Responsive Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg sm:text-xl text-indigo-600">Cricket Analytics</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-indigo-600">Home</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600">Features</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600">About</a>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="px-2 sm:px-4 py-2 text-sm rounded-md text-gray-700 hover:text-indigo-600">
                Sign In
              </button>
              <button className="px-2 sm:px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Responsive Banner Slider */}
      <div className="relative overflow-hidden bg-white mx-4 sm:mx-8 lg:mx-40 my-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center">
            <div
              className="flex transition-transform duration-500 ease-in-out w-full"
              style={{
                transform: `translateX(-${currentBanner * 100}%)`,
              }}
            >
              {bannerData.map((banner, index) => (
                <div
                  key={index}
                  className={`${banner.bgColor} border-4 sm:border-8 border-white min-w-full rounded-xl p-4 sm:p-8 transform transition-transform duration-500 hover:scale-105 cursor-pointer`}
                  style={{
                    width: "100%",
                    opacity: index === currentBanner ? 1 : 0.7,
                  }}
                >
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">{banner.title}</h2>
                  <p className="text-white text-sm sm:text-lg">{banner.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Upcoming Matches */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-40 py-4">
        <div className="flex items-center justify-between mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Upcoming Matches
          </h2>
          <button className="px-2 sm:px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 sm:gap-2">
            View All 
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {upcomingMatches.map((match) => (
            <div 
              key={match.id} 
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* League Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3 sm:px-6 py-2 sm:py-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-medium">{match.league}</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Upcoming</span>
                  </div>
                </div>
              </div>

              {/* Match Content */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-6">
                    {/* Team 1 */}
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-md border-2 border-indigo-50 mb-2">
                        {match.team1}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{match.team1}</span>
                    </div>

                    {/* VS Badge */}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">VS</span>
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-md border-2 border-purple-50 mb-2">
                        {match.team2}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{match.team2}</span>
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-4 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                      {new Date(match.startTime).toLocaleDateString(undefined, { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">{match.venue}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button 
                    onClick={() => handleMatchAction(match)}
                    className="px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analysis
                  </button>
                  <button 
                    onClick={() => handleMatchAction(match)}
                    className="px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fantasy
                  </button>
                  <button 
                    onClick={() => handleMatchAction(match)}
                    className="px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Discussion
                  </button>
                  <button 
                    onClick={() => handleMatchAction(match)}
                    className="px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Predictions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top News Section */}
      <div className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopNews/>
        </div>
      </div>
    </div>
  );
};

export default HomePage;