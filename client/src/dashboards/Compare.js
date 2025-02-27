import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckTreePicker } from 'rsuite';
import { TrendingUp, TrendingDown, Minus, Users, ChevronDown, BarChart2 } from 'lucide-react';
import 'rsuite/CheckTreePicker/styles/index.css';

const PlayerComparison = () => {
  const { match_id } = useParams();
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mockTreeData, setMockTreeData] = useState([]);
  const [playerData, setPlayerData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Dynamic imports based on match_id
        const [treeDataModule, playerDataModule] = await Promise.all([
          import(`../utilities/${match_id}_TreeData.js`),
          import(`../utilities/${match_id}_playerWiseData.json`)
        ]);

        setMockTreeData(treeDataModule.default);
        setPlayerData(playerDataModule.default);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load player data');
        setLoading(false);
      }
    };

    loadData();
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

  // Helper function to extract player IDs from selection
  const extractPlayerIds = (value) => {
    const playerIds = [];
    
    value.forEach(item => {
      if (typeof item === 'number') {
        playerIds.push(item);
      } else {
        const team = mockTreeData.find(t => t.value === item);
        if (team) {
          team.children.forEach(category => {
            category.children.forEach(player => {
              playerIds.push(player.value);
            });
          });
        } else {
          mockTreeData.forEach(team => {
            team.children.forEach(category => {
              if (category.value === item || (Array.isArray(category.value) && category.value.includes(item))) {
                category.children.forEach(player => {
                  playerIds.push(player.value);
                });
              }
            });
          });
        }
      }
    });

    return [...new Set(playerIds)];
  };

  // Modified handlers for team selection
  const handleTeam1Selection = (value) => {
    const playerIds = extractPlayerIds(value);
    setTeam1Players(playerIds);
  };

  const handleTeam2Selection = (value) => {
    const playerIds = extractPlayerIds(value);
    setTeam2Players(playerIds);
  };

  const calculateTeamStats = (playerIds) => {
    let totalRuns = 0;
    let totalWickets = 0;
    let totalBoundaries = 0;
    let totalBalls = 0;
    let totalFantasyPoints = 0;
    let recentMatches = [];
    let avgbattingFantasyPoints = 0;
    let avgbowlingFantasyPoints = 0;
    let validPlayers = 0;

    playerIds.forEach(playerId => {
      const player = playerData[playerId];
      // Skip if player data doesn't exist
      if (!player) return;
      validPlayers++;

      // Calculate batting stats
      if (player.batting) {
        const matches = player.batting.matches || [];
        totalRuns += player.batting.total_runs || 0;
        totalBalls += player.batting.total_balls || 0;
        
        if (matches.length > 0) {
          avgbattingFantasyPoints += (player.batting.total_fantasy_points || 0) / matches.length;
        }

        // Calculate boundary percentage safely
        if (player.batting.boundary_analysis && typeof player.batting.boundary_analysis.percentage === 'number') {
          totalBoundaries += player.batting.boundary_analysis.percentage;
        }
      }

      // Calculate bowling stats
      if (player.bowling) {
        const matches = player.bowling.matches || [];
        totalWickets += player.bowling.total_wickets || 0;
        
        if (matches.length > 0) {
          avgbowlingFantasyPoints += (player.bowling.total_fantasy_points || 0) / matches.length;
        }
      }

      // Calculate total fantasy points
      if (avgbattingFantasyPoints === 0 || avgbowlingFantasyPoints === 0) {
        totalFantasyPoints = avgbattingFantasyPoints + avgbowlingFantasyPoints;
      } else {
        totalFantasyPoints = (avgbattingFantasyPoints + avgbowlingFantasyPoints) / 2;
      }

      // Get recent match stats safely
      const recentBattingMatches = player.batting?.matches?.slice(0, 5) || [];
      const recentBowlingMatches = player.bowling?.matches?.slice(0, 5) || [];

      if (recentBattingMatches.length > 0 || recentBowlingMatches.length > 0) {
        recentMatches.push({
          name: player.name,
          matches: recentBattingMatches.map((match, idx) => ({
            runs: match.runs || 0,
            wickets: (recentBowlingMatches[idx]?.wickets || 0)
          }))
        });
      }
    });

    // Avoid division by zero
    const effectivePlayerCount = validPlayers || 1;

    return {
      totalRuns,
      totalWickets,
      avgBoundaryPercentage: totalBoundaries / effectivePlayerCount,
      strikeRate: totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0,
      avgFantasyPoints: totalFantasyPoints / effectivePlayerCount,
      recentMatches,
    };
  };

  const renderComparisonIndicator = (value1, value2) => {
    const difference = ((value1 - value2) / value2) * 100;
    if (Math.abs(difference) < 1) {
      return <Minus className="mx-auto text-gray-400" />;
    }
    return difference > 0 ? (
      <TrendingUp className="mx-auto text-green-500" />
    ) : (
      <TrendingDown className="mx-auto text-red-500" />
    );
  };

  const renderStatComparison = () => {
    const team1Stats = calculateTeamStats(team1Players);
    const team2Stats = calculateTeamStats(team2Players);

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="text-indigo-600" />
            Statistical Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Metric</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-indigo-600">Team 1</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Comparison</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-purple-600">Team 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-700">Total Runs</td>
                <td className="text-center py-4 px-6 text-indigo-600 font-semibold">{team1Stats.totalRuns}</td>
                <td className="text-center py-4 px-6">
                  {renderComparisonIndicator(team1Stats.totalRuns, team2Stats.totalRuns)}
                </td>
                <td className="text-center py-4 px-6 text-purple-600 font-semibold">{team2Stats.totalRuns}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-700">Total Wickets</td>
                <td className="text-center py-4 px-6 text-indigo-600 font-semibold">{team1Stats.totalWickets}</td>
                <td className="text-center py-4 px-6">
                  {renderComparisonIndicator(team1Stats.totalWickets, team2Stats.totalWickets)}
                </td>
                <td className="text-center py-4 px-6 text-purple-600 font-semibold">{team2Stats.totalWickets}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-700">Strike Rate</td>
                <td className="text-center py-4 px-6 text-indigo-600 font-semibold">{team1Stats.strikeRate.toFixed(2)}</td>
                <td className="text-center py-4 px-6">
                  {renderComparisonIndicator(team1Stats.strikeRate, team2Stats.strikeRate)}
                </td>
                <td className="text-center py-4 px-6 text-purple-600 font-semibold">{team2Stats.strikeRate.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-700">Boundary %</td>
                <td className="text-center py-4 px-6 text-indigo-600 font-semibold">{team1Stats.avgBoundaryPercentage.toFixed(2)}%</td>
                <td className="text-center py-4 px-6">
                  {renderComparisonIndicator(team1Stats.avgBoundaryPercentage, team2Stats.avgBoundaryPercentage)}
                </td>
                <td className="text-center py-4 px-6 text-purple-600 font-semibold">{team2Stats.avgBoundaryPercentage.toFixed(2)}%</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-700">Avg Fantasy Points</td>
                <td className="text-center py-4 px-6 text-indigo-600 font-semibold">{team1Stats.avgFantasyPoints.toFixed(2)}</td>
                <td className="text-center py-4 px-6">
                  {renderComparisonIndicator(team1Stats.avgFantasyPoints, team2Stats.avgFantasyPoints)}
                </td>
                <td className="text-center py-4 px-6 text-purple-600 font-semibold">{team2Stats.avgFantasyPoints.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRecentForm = () => {
    const team1Stats = calculateTeamStats(team1Players);
    const team2Stats = calculateTeamStats(team2Players);

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ChevronDown className="text-indigo-600" />
            Recent Form Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { name: 'Team 1', stats: team1Stats, color: 'indigo' },
              { name: 'Team 2', stats: team2Stats, color: 'purple' }
            ].map((team) => (
              <div key={team.name} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className={`bg-${team.color}-50 p-4 border-b`}>
                  <h4 className={`text-lg font-semibold text-${team.color}-600 flex items-center gap-2`}>
                    <Users className={`text-${team.color}-500`} />
                    {team.name} Performance
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {team.stats.recentMatches.map((player, playerIdx) => (
                    <div key={playerIdx} className="p-4">
                      <h5 className="font-medium text-gray-700 mb-3">{player.name}</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Match</th>
                              <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">Runs</th>
                              <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">Wickets</th>
                            </tr>
                          </thead>
                          <tbody>
                            {player.matches.map((match, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-4 text-sm text-gray-600">Match {idx + 1}</td>
                                <td className="text-center py-2 px-4 text-sm font-medium text-gray-700">{match.runs}</td>
                                <td className="text-center py-2 px-4 text-sm font-medium text-gray-700">{match.wickets}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Player Comparison Analysis
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Compare statistics and performance metrics between players
          </p>
        </div>

        {/* Selection Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="text-indigo-600" />
                Team 1 Selection
              </h3>
              <CheckTreePicker
                data={mockTreeData}
                onChange={handleTeam1Selection}
                style={{ width: '100%' }}
                placeholder="Select Team 1 Players"
                cascade={true}
                countable={true}
                defaultExpandAll={true}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="text-purple-600" />
                Team 2 Selection
              </h3>
              <CheckTreePicker
                data={mockTreeData}
                onChange={handleTeam2Selection}
                style={{ width: '100%' }}
                placeholder="Select Team 2 Players"
                cascade={true}
                countable={true}
                defaultExpandAll={true}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowComparison(true)}
              disabled={!team1Players.length || !team2Players.length}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
                hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400
                transition-all duration-200 font-medium shadow-lg disabled:shadow-none
                disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              Compare Players
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {showComparison && (
          <div className="space-y-8">
            {renderStatComparison()}
            {renderRecentForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerComparison;