import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, Clock } from 'lucide-react';
import TopNews from '../components/TopNews';
import axios from 'axios';
import Navbar from '../components/Navbar';

const bannerData = [
  // Banner data remains unchanged
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
        const response = await axios.get('https://cricket-analytics-node.onrender.com/api/matches/upcoming');
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

  const handleMatchClick = (match) => {
    navigate(`/menubar/${match.id}/${match.team1_name}vs${match.team2_name}`);
  };

  // Format time function
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Banner Slider */}
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

      {/* Upcoming Matches Section - Improved UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-40 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Upcoming Matches
          </h2>
          <button className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All 
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match) => (
            <div 
              key={match.id} 
              onClick={() => handleMatchClick(match)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:translate-y-px border border-gray-100"
            >
              {/* League Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{match.league}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Upcoming</span>
                  </div>
                </div>
              </div>

              {/* Match Content */}
              <div className="p-4">
                {/* Teams */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-gray-100 mb-2">
                      {match.team1}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{match.team1}</span>
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-400 mb-1">VS</div>
                    <div className="font-bold text-xs text-indigo-600 px-2 py-1 bg-indigo-50 rounded-full">
                      {formatTime(match.startTime)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-gray-100 mb-2">
                      {match.team2}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{match.team2}</span>
                  </div>
                </div>

                {/* Match Details */}
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">{formatDate(match.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs truncate">{match.venue}</span>
                  </div>
                </div>

                {/* View Match CTA */}
                <div className="mt-4 text-center">
                  <div className="inline-block text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200">
                    View match details →
                  </div>
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