import React, { useState, useEffect } from 'react';
import { Trophy, Target, MapPin, Zap, Users, Star, Cloud, List, TrendingUp } from 'lucide-react';
// import data from './${match_id}_match_insights.json';
import {useParams} from 'react-router-dom';


const FantasyInsights = () => {

  const { match_id } = useParams(); // Get match_id from URL params
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        setLoading(true);
        // Dynamic import based on match_id
        const matchData = await import(`../utilities/${match_id}_match_insights.json`);
        setData(matchData.default);
        setLoading(false);
      } catch (err) {
        console.error('Error loading match data:', err);
        setError('Failed to load match data');
        setLoading(false);
      }
    };

    loadMatchData();
  }, [match_id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
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

  // No data state
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p>Match insights are not available for this match.</p>
        </div>
      </div>
    );
  }

  // Mock data for sections not in original JSON
  const weatherData = {
    temperature: "28°C",
    humidity: "65%",
    windSpeed: "12 km/h",
    chanceOfRain: "10%"
  };

  const predictedXI = {
    team1: {
      name: "Team 1",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8", "Player 9", "Player 10", "Player 11"]
    },
    team2: {
      name: "Team 2",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8", "Player 9", "Player 10", "Player 11"]
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Fantasy Cricket Insights</h1>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Player Form */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-semibold">Player Form</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.top_performers.form_players.slice(0, 5).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {player.role} • {player.fantasy_points} Points
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-semibold">Top Performers</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.top_performers.batsmen.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {'Batsman'} • {player.fantasy_points} Points
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-4">
            {data.match_insights.top_performers.all_rounders.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {'All rounder'} • {player.fantasy_points} Points
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-4">
            {data.match_insights.top_performers.bowlers.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {'Bowler'} • {player.fantasy_points} Points
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pitch Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold">Pitch Analysis</h2>
          </div>
          <div className="space-y-3">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium">Pace Bowling</p>
              <p className="text-sm text-gray-600">
                Economy: {data.match_insights.venue_analysis.pitch_behavior.pace_bowling.economy_rate}
                • Wickets: {data.match_insights.venue_analysis.pitch_behavior.pace_bowling.total_wickets}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium">Spin Bowling</p>
              <p className="text-sm text-gray-600">
                Economy: {data.match_insights.venue_analysis.pitch_behavior.spin_bowling.economy_rate}
                • Wickets: {data.match_insights.venue_analysis.pitch_behavior.spin_bowling.total_wickets}
              </p>
            </div>
          </div>
        </div>

        {/* Phase Specialists */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-semibold">Death Specialists</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.phase_specialists.death.batsmen.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-600">SR: {player.strike_rate}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-4">
            {data.match_insights.phase_specialists.death.bowlers.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-600">Eco: {player.economy}</p>
                <p className="text-sm text-gray-600">Wickets: {player.wickets}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-semibold">Powerplay Specialists</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.phase_specialists.powerplay.batsmen.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-600">SR: {player.strike_rate}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-4">
            {data.match_insights.phase_specialists.powerplay.bowlers.slice(0, 2).map((player) => (
              <div key={player.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-600">Eco: {player.economy}</p>
                <p className="text-sm text-gray-600">Wickets: {player.wickets}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Captain Picks */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-semibold">Captain Picks</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.captain_recommendations.captain_picks.map((pick) => (
              <div key={pick.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{pick.name}</p>
                <p className="text-sm text-gray-600">{pick.role} • Score: {pick.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Cloud className="w-6 h-6 text-cyan-500" />
            <h2 className="text-lg font-semibold">Weather Conditions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-sm text-gray-600">{weatherData.temperature}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">Humidity</p>
              <p className="text-sm text-gray-600">{weatherData.humidity}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">Wind Speed</p>
              <p className="text-sm text-gray-600">{weatherData.windSpeed}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">Rain Chance</p>
              <p className="text-sm text-gray-600">{weatherData.chanceOfRain}</p>
            </div>
          </div>
        </div>

        {/* Differential Picks */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-semibold">Differential Picks</h2>
          </div>
          <div className="space-y-3">
            {data.match_insights.captain_recommendations.differential_picks.map((pick) => (
              <div key={pick.name} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{pick.name}</p>
                <p className="text-sm text-gray-600">{pick.role} • Score: {pick.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6 mt-6">
        {/* Predicted XI */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <List className="w-6 h-6 text-indigo-500" />
            <h2 className="text-lg font-semibold">Predicted Playing XI</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[predictedXI.team1, predictedXI.team2].map((team) => (
              <div key={team.name} className="space-y-2">
                <h3 className="font-medium">{team.name}</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm">{team.players.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fantasy Tips */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold">Key Fantasy Tips</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">• Pick players batting in top 4 for this high-scoring venue</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">• Prefer {data.match_insights.venue_analysis.toss_analysis.preferred_choice} first specialists based on toss analysis</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">• Include death over specialists for maximum points</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">• Consider pitch behavior while selecting spinner vs pacer ratio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyInsights;