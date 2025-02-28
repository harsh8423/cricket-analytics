import React, { useState, useEffect } from 'react';
import TeamView from './TeamView';
import { Users, Award, Check, X, Filter } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const HeadToHead = ({ teamname }) => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://cricket-analytics-node.onrender.com/api/matches/team-performance/${teamname}`);
        setRecentMatches(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team performance:', err);
        setError('Failed to load team performance data');
        setLoading(false);
      }
    };

    if (teamname) {
      fetchTeamPerformance();
    }
  }, [teamname]);

  if (loading) {
    return (
      <div className="bg-white mb-8 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white mb-8 rounded-xl p-6">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mb-8 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-2" />
          Recent Team Performance
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentMatches.map((match, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-4">
              {/* Header with Date and Result */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">{match.date}</span>
                <div className={`
                  px-3 py-1 rounded-full flex items-center
                  ${match.result === 'Won' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                `}>
                  {match.result === 'Won' ? 
                    <Check className="w-4 h-4 mr-1" /> : 
                    <X className="w-4 h-4 mr-1" />
                  }
                  <span className="text-sm font-medium">{match.result}</span>
                </div>
              </div>

              {/* Match Details */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">{match.score}</div>
                <div className="text-xs text-gray-500">{match.venue}</div>
              </div>

              {/* Top Performers */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase">Top Performers</div>
                {match.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">{performer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2">
                        {performer.role}
                      </span>
                      <span className="text-sm text-gray-600">{performer.performance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayerCard = ({ player, isSelected, onClick }) => {
  const getRecentStats = () => {
    if (player.role === 'Bowler') {
      // Get last 5 bowling matches stats
      const recentBowling = player.bowling?.matches
        ?.filter(m => m.stats_type === 'recent')
        ?.slice(0, 5)
        ?.map(m => `${m.wickets}w`)
        ?.join(', ') || '0w, 0w, 0w, 0w, 0w';
      return recentBowling;
    }
    // Get last 5 batting matches stats
    const recentBatting = player.batting?.matches
      ?.filter(m => m.stats_type === 'recent')
      ?.slice(0, 5)
      ?.map(m => m.runs)
      ?.join(', ') || '0, 0, 0, 0, 0';
    return recentBatting;
  };

  const getVenueStats = () => {
    if (player.role === 'Bowler') {
      // Get venue bowling stats
      const venueBowling = player.bowling?.matches
        ?.filter(m => m.stats_type === 'venue')
        ?.map(m => `${m.wickets}w`)
        ?.join(', ') || '0w';
      return venueBowling;
    }
    // Get venue batting stats
    const venueBatting = player.batting?.matches
      ?.filter(m => m.stats_type === 'venue')
      ?.map(m => m.runs)
      ?.join(', ') || '0';
    return venueBatting;
  };

  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-300 ease-in-out
        flex flex-col items-center p-4 rounded-xl mx-auto
        ${isSelected 
          ? 'bg-white shadow-lg border-2 border-indigo-500 scale-105 z-10' 
          : 'bg-white hover:bg-gray-50 border border-gray-100'
        }
        w-full sm:w-[180px]
      `}
    >
      <h3 className={`
        text-sm font-semibold text-center
        ${isSelected ? 'text-gray-900' : 'text-gray-700'}
      `}>
        {player.name}
      </h3>
      <span className={`
        text-xs mt-1 mb-2
        ${isSelected ? 'text-indigo-600' : 'text-gray-500'}
      `}>
        {player.role}
      </span>
      
      <div className="text-[10px] text-gray-500 text-center space-y-1">
        <p>
          <span className="font-medium">Recent: </span>
          {getRecentStats()}
        </p>
        <p>
          <span className="font-medium">At Venue: </span>
          {getVenueStats()}
        </p>
      </div>
    </div>
  );
};

const PlayersDetails = ({ players }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const roles = ['All', 'Batsman', 'Bowler', 'Bowling Allrounder', 'Batting Allrounder', 'WK-Batsman'];

  // Group all players by role regardless of filter
  const allGroupedPlayers = players.reduce((acc, player) => {
    const role = player.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push({
      id: player.player_id,
      name: player.name,
      role: player.role,
      batting: player.batting,
      bowling: player.bowling,
      team_name: player.team_name,
      batting_style: player.batting_style,
      bowling_style: player.bowling_style
    });
    return acc;
  }, {});

  return (
    <div className="bg-white mb-8 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-2" />
          Team Squad
        </h2>
      </div>

      {/* Role Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setActiveFilter(role)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${activeFilter === role 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Players Grid - Grouped by Role */}
      <div className="space-y-8">
        {Object.entries(allGroupedPlayers)
          .filter(([role]) => activeFilter === 'All' || role === activeFilter)
          .map(([role, rolePlayers]) => (
            <div key={role} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 place-items-center">
                {rolePlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayer?.id === player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <TeamView 
            player={selectedPlayer} 
            isOpen={isModalOpen} 
            onRequestClose={() => setIsModalOpen(false)} 
          />
        </>
      )}
    </div>
  );
};

const TeamDetails = ({teamname}) => {
  const { match_id} = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        setLoading(true);
        const data = await import(`../utilities/${match_id}_playerWiseData.json`);
        setPlayerData(data.default);
        setLoading(false);
      } catch (err) {
        console.error('Error loading player data:', err);
        setError('Failed to load player data');
        setLoading(false);
      }
    };

    loadPlayerData();
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
  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p>Team details are not available for this match.</p>
        </div>
      </div>
    );
  }

  const players = Object.values(playerData).filter(player => player.team_name === teamname);

  return (
    <div className="mx-auto">
      <HeadToHead teamname={teamname} />
      <PlayersDetails teamname={teamname} players={players} />
    </div>
  );
};

export default TeamDetails;