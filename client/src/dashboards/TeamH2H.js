import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, MapPin, Users, TrendingDown, Trophy } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


export default function TeamH2H() {
  const { teamname } = useParams();
  const [team1_name, setTeam1_name] = useState(null);
  const [team2_name, setTeam2_name] = useState(null);
  const [lastFiveMatches, setLastFiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [h2hData, setH2hData] = useState({
    team1: '',
    team2: '',
    winPredictor: {
      team1: 0,
      team2: 0
    }
  });

  useEffect(() => {
    const extractTeams = (teamInfo) => {
      if (!teamInfo) return { team1: "", team2: "" };
      
      const teams = teamInfo.split("vs");
      const team1 = teams[0]?.replace(/%20/g, " ").trim();
      const team2 = teams[1]?.replace(/%20/g, " ").trim();
      
      setTeam1_name(team1);
      setTeam2_name(team2);
      
      // Set h2hData with team names
      setH2hData(prev => ({
        ...prev,
        team1: team1,
        team2: team2,
        winPredictor: {
          team1: 55, // You can calculate this based on match history
          team2: 45  // You can calculate this based on match history
        }
      }));
      
      // Fetch head-to-head data
      fetchH2HData(team1, team2);
    };

    const fetchH2HData = async (team1, team2) => {
      try {
        const [h2hResponse, predictionsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/matches/head2head/${team1}/${team2}`),
          axios.get(`http://localhost:8000/api/matches/predictions/${team1}/${team2}`)
        ]);

        setLastFiveMatches(h2hResponse.data);
        
        // Update win predictions
        setH2hData(prev => ({
          ...prev,
          winPredictor: {
            team1: predictionsResponse.data.team1.prediction,
            team2: predictionsResponse.data.team2.prediction
          }
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching H2H data:', err);
        setError('Failed to load match history');
        setLoading(false);
      }
    };

    extractTeams(teamname);
  }, [teamname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-2" />
          Head to Head
        </h2>
      </div>

      {/* Last 5 Matches */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold">Recent Encounters</h3>
        {lastFiveMatches.map((match, idx) => (
          <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{match.date}</span>
              <span className="text-sm font-medium text-blue-600">{match.result}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">{match.score}</div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-amber-500 mr-1" />
                <span className="text-sm font-medium">{match.topPerformerTeam1.name}</span>
                <span className="text-xs text-gray-500 ml-2">{match.topPerformerTeam1.performance}</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 text-amber-500 mr-1" />
                <span className="text-sm font-medium">{match.topPerformerTeam2.name}</span>
                <span className="text-xs text-gray-500 ml-2">{match.topPerformerTeam2.performance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Win Predictor */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Win Predictor</h3>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${h2hData.winPredictor.team1}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
            <span>{h2hData.team1} ({h2hData.winPredictor.team1}%)</span>
          </div>
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-purple-600 mr-1" />
            <span>{h2hData.team2} ({h2hData.winPredictor.team2}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
