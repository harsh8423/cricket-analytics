import React, { useState, useMemo } from 'react';
import { Users, ArrowUpDown } from 'lucide-react';
const playerData = require('./playerWiseData');

const PlayerAnalytics = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  const roles = {
    all: 'All Players',
    Batsman: 'Batsmen',
    Bowler: 'Bowlers',
    'Bowling Allrounder': 'All-rounders'
  };

  const processedData = useMemo(() => {
    return Object.values(playerData)
      .filter(player => selectedRole === 'all' || player.role === selectedRole)
      .map(player => {
        const totalFantasyPoints = (player.batting?.total_fantasy_points || 0) + 
                                 (player.bowling?.total_fantasy_points || 0);
        
        // Calculate economy for bowlers
        const economy = player.bowling?.total_runs && player.bowling?.total_balls ? 
          (player.bowling.total_runs / (player.bowling.total_balls / 6)).toFixed(2) : 
          null;

        return {
          id: player.player_id,
          name: player.name,
          role: player.role,
          team: player.team_name,
          battingStyle: player.batting_style,
          bowlingStyle: player.bowling_style,
          // Batting stats
          totalRuns: player.batting?.total_runs || 0,
          averageRuns: player.batting?.average_runs?.toFixed(2) || 0,
          strikeRate: player.batting?.overall_strike_rate?.toFixed(2) || 0,
          battingFantasyPoints: player.batting?.total_fantasy_points || 0,
          // Bowling stats
          totalWickets: player.bowling?.total_wickets || 0,
          economy: economy || 0,
          ballsPerWicket: player.bowling?.balls_per_wicket?.toFixed(2) || 0,
          bowlingFantasyPoints: player.bowling?.total_fantasy_points || 0,
          // Combined stats
          totalFantasyPoints
        };
      });
  }, [selectedRole]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return processedData;
    
    return [...processedData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [processedData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortButton = ({ column }) => (
    <button 
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-1 hover:text-blue-600"
    >
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  const renderTable = () => {
    const isBatting = selectedRole === 'Batsman';
    const isBowling = selectedRole === 'Bowler';
    const isAllRounder = selectedRole === 'Bowling Allrounder';
    const showAll = selectedRole === 'all';

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold border-b">Player</th>
              <th className="p-3 text-left font-semibold border-b">Team</th>
              {(isBatting || isAllRounder || showAll) && (
                <>
                  <th className="p-3 text-right font-semibold border-b">
                    Runs <SortButton column="totalRuns" />
                  </th>
                  <th className="p-3 text-right font-semibold border-b">
                    Average <SortButton column="averageRuns" />
                  </th>
                  <th className="p-3 text-right font-semibold border-b">
                    Strike Rate <SortButton column="strikeRate" />
                  </th>
                </>
              )}
              {(isBowling || isAllRounder || showAll) && (
                <>
                  <th className="p-3 text-right font-semibold border-b">
                    Wickets <SortButton column="totalWickets" />
                  </th>
                  <th className="p-3 text-right font-semibold border-b">
                    Economy <SortButton column="economy" />
                  </th>
                  <th className="p-3 text-right font-semibold border-b">
                    Balls/Wicket <SortButton column="ballsPerWicket" />
                  </th>
                </>
              )}
              <th className="p-3 text-right font-semibold border-b">
                Fantasy Points <SortButton column="totalFantasyPoints" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((player) => (
              <tr 
                key={player.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 border-b">
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.role}</div>
                  </div>
                </td>
                <td className="p-3 border-b">
                  <div className="text-sm">{player.team}</div>
                </td>
                {(isBatting || isAllRounder || showAll) && (
                  <>
                    <td className="p-3 text-right border-b">{player.totalRuns}</td>
                    <td className="p-3 text-right border-b">{player.averageRuns}</td>
                    <td className="p-3 text-right border-b">{player.strikeRate}</td>
                  </>
                )}
                {(isBowling || isAllRounder || showAll) && (
                  <>
                    <td className="p-3 text-right border-b">{player.totalWickets}</td>
                    <td className="p-3 text-right border-b">{player.economy}</td>
                    <td className="p-3 text-right border-b">{player.ballsPerWicket}</td>
                  </>
                )}
                <td className="p-3 text-right border-b font-medium text-blue-600">
                  {player.totalFantasyPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-white mb-8">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Player Analytics
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Filter by Role</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roles).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    selectedRole === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default PlayerAnalytics;