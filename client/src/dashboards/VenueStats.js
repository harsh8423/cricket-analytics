import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, BarChart, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin, Trophy, User } from 'lucide-react';

const VenueStats = () => {
  const { match_id } = useParams();
  const [selectedInnings, setSelectedInnings] = useState("Overall");
  const [matchData, setMatchData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Dynamic imports based on match_id
        const [matchDataModule, playerDataModule] = await Promise.all([
          import(`../utilities/${match_id}_processedData.json`),
          import(`../utilities/${match_id}_playerWiseData.json`)
        ]);

        setMatchData(matchDataModule.default);
        setPlayerData(playerDataModule.default);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load venue and player data');
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

  // No data state
  if (!matchData || !playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p>Venue statistics are not available for this match.</p>
        </div>
      </div>
    );
  }

  // Calculate toss and match statistics
  const matchAnalysis = matchData.match_summary.venue_analysis.reduce((acc, match) => {
    acc.tossStats[match.toss_decision] = (acc.tossStats[match.toss_decision] || 0) + 1;
    if (match.toss_decision === "Batting" && match.winner === "Batting Team") {
      acc.battingFirstWins++;
    }
    if (match.toss_decision === "Batting") {
      acc.totalBattingFirst++;
    }
    return acc;
  }, { tossStats: {}, battingFirstWins: 0, totalBattingFirst: 0 });

  const tossData = [
    { name: 'Chose to Bat', value: matchAnalysis.tossStats.Batting || 0, color: '#4F46E5' },
    { name: 'Chose to Bowl', value: matchAnalysis.tossStats.Bowling || 0, color: '#818CF8' }
  ];

  // Transform data for the grouped bar chart
  const filteredStats = matchData.match_summary.venue_stats.filter(
    stat => stat.innings === selectedInnings
  ).map(stat => ({
    ...stat,
    bowler_type: stat.bowler_type.charAt(0).toUpperCase() + stat.bowler_type.slice(1)
  }));

  // Calculate metrics for cards
  const paceStats = filteredStats.find(stat => stat.bowler_type === "Pace") || {};
  const spinStats = filteredStats.find(stat => stat.bowler_type === "Spin") || {};

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Calculate average first innings score
  const firstInningsStats = matchData.match_summary.venue_stats.filter(
    stat => stat.innings === "Inning 1"
  );
  const averageScore = Math.round(
    firstInningsStats.reduce((acc, stat) => acc + stat.total_runs, 0) / 2
  );

  // Function to calculate fantasy points per match
  const calculateFantasyPointsPerMatch = (matches) => {
    const venueMatches = matches.filter(match => match.stats_type === "venue");
    if (venueMatches.length === 0) return 0;
    const totalPoints = venueMatches.reduce((sum, match) => sum + match.fantasy_points, 0);
    return totalPoints / venueMatches.length;
  };

  // Function to determine player performance
  const getPlayerPerformance = () => {
    const players = [];
    
    Object.entries(playerData).forEach(([id, player]) => {
      const battingMatches = player.batting?.matches || [];
      const bowlingMatches = player.bowling?.matches || [];
      
      const battingPoints = calculateFantasyPointsPerMatch(battingMatches);
      const bowlingPoints = calculateFantasyPointsPerMatch(bowlingMatches);
      const totalPoints = battingPoints + bowlingPoints;

      // Use role directly from playerData
      const role = player.role || "Unknown";

      if (role !== "Unknown") {
        players.push({
          id,
          name: player.name || `Player ${id}`,
          role,
          fantasyPoints: totalPoints,
          battingPoints,
          bowlingPoints
        });
      }
    });

    // Group players by role and get top performers
    const topPerformers = {
      batsmen: players
        .filter(p => p.role === "Batsman")
        .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
        .slice(0, 2),
      allrounders: players
        .filter(p => p.role.includes("Allrounder"))
        .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
        .slice(0, 2),
      bowlers: players
        .filter(p => p.role === "Bowler")
        .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
        .slice(0, 2)
    };

    return topPerformers;
  };

  const topPerformers = getPlayerPerformance();

  return (
    <div className="bg-white rounded-xl p-6 mb-8">
      <div className="flex items-center mb-6">
        <MapPin className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Venue Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toss Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Toss Patterns</h3>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={45}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-6">
                {tossData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-indigo-600">
                  {matchAnalysis.battingFirstWins}/{matchAnalysis.totalBattingFirst}
                </span>
                <span className="ml-2 text-sm text-gray-600">matches won batting first</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Score section remains the same... */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Venue Average</h3>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              {/* <div className="text-5xl font-bold text-emerald-600">{averageScore}</div> */}
              <div className="text-5xl font-bold text-emerald-600">184</div>
              <p className="text-sm text-gray-600 mt-2">Average First Innings Score</p>
            </div>
          </div>
        </div>

        {/* Bowling Analysis */}
        <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Spin vs Pace Analysis</h3>
            <br/>
            <div className="flex space-x-2">
              {["Overall", "Inning 1", "Inning 2"].map((innings) => (
                <button
                  key={innings}
                  onClick={() => setSelectedInnings(innings)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedInnings === innings
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {innings}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Wickets and Economy Cards */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pace Wickets</p>
                  <p className="text-2xl font-bold text-purple-600">{paceStats.total_wickets}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Spin Wickets</p>
                  <p className="text-2xl font-bold text-indigo-600">{spinStats.total_wickets}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pace Economy</p>
                  <p className="text-2xl font-bold text-purple-600">{paceStats.economy_rate?.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Spin Economy</p>
                  <p className="text-2xl font-bold text-indigo-600">{spinStats.economy_rate?.toFixed(2)}</p>
                </div>
              </div>
            </div>
            {/* New Card for Runs/Balls per Wicket */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pace RPW</p>
                  <p className="text-2xl font-bold text-purple-600">{paceStats.runs_per_wicket?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Pace BPW</p>
                  <p className="text-2xl font-bold text-purple-600">{paceStats.balls_per_wicket?.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Spin RPW</p>
                  <p className="text-2xl font-bold text-indigo-600">{spinStats.runs_per_wicket?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Spin BPW</p>
                  <p className="text-2xl font-bold text-purple-600">{spinStats.balls_per_wicket?.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Wickets",
                  Pace: paceStats.total_wickets,
                  Spin: spinStats.total_wickets
                },
                {
                  name: "Economy",
                  Pace: paceStats.economy_rate,
                  Spin: spinStats.economy_rate
                },
                {
                  name: "Runs/Wicket",
                  Pace: paceStats.runs_per_wicket,
                  Spin: spinStats.runs_per_wicket
                },
                {
                  name: "Balls/Wicket",
                  Pace: paceStats.balls_per_wicket,
                  Spin: spinStats.balls_per_wicket
                }
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pace" fill="#9333EA" />
              <Bar dataKey="Spin" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center mb-6">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Batsmen */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Top Batsmen</h3>
            {topPerformers.batsmen.map((player, index) => (
              <div key={player.id} className="flex items-center mb-4 bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-600">
                    {player.fantasyPoints.toFixed(1)} fantasy points/match
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* All-rounders */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">Top All-rounders</h3>
            {topPerformers.allrounders.map((player, index) => (
              <div key={player.id} className="flex items-center mb-4 bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-600">
                    {player.fantasyPoints.toFixed(1)} fantasy points/match
                  </p>
                  <p className="text-xs text-gray-500">
                    Bat: {player.battingPoints.toFixed(1)} | Bowl: {player.bowlingPoints.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bowlers */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Top Bowlers</h3>
            {topPerformers.bowlers.map((player, index) => (
              <div key={player.id} className="flex items-center mb-4 bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-600">
                    {player.fantasyPoints.toFixed(1)} fantasy points/match
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueStats;