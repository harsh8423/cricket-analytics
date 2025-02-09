import React, { useState } from 'react';
import { CheckTreePicker } from 'rsuite';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockTreeData } from './mock';
import 'rsuite/CheckTreePicker/styles/index.css';
const playerData = require('./playerWiseData');

const PlayerComparison = () => {
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const calculateTeamStats = (playerIds) => {
    let totalRuns = 0;
    let totalWickets = 0;
    let totalBoundaries = 0;
    let totalBalls = 0;
    let totalFantasyPoints = 0;
    let recentMatches = [];
    let phaseStats = {
      powerplay: { runs: 0, wickets: 0, balls: 0 },
      middle: { runs: 0, wickets: 0, balls: 0 },
      death: { runs: 0, wickets: 0, balls: 0 }
    };

    playerIds.forEach(playerId => {
      const player = playerData[playerId];
      if (!player) return;

      // Calculate batting stats
      if (player.batting) {
        totalRuns += player.batting.total_runs || 0;
        totalBalls += player.batting.total_balls || 0;
        totalFantasyPoints += player.batting.total_fantasy_points || 0;

        // Add batting phase stats
        if (player.batting.phase_stats) {
          Object.entries(player.batting.phase_stats).forEach(([phase, stats]) => {
            phaseStats[phase].runs += stats.runs || 0;
            phaseStats[phase].balls += stats.balls || 0;
          });
        }
      }

      // Calculate bowling stats
      if (player.bowling) {
        totalWickets += player.bowling.total_wickets || 0;
        totalFantasyPoints += player.bowling.total_fantasy_points || 0;

        // Add bowling phase stats
        if (player.bowling.phase_stats) {
          Object.entries(player.bowling.phase_stats).forEach(([phase, stats]) => {
            phaseStats[phase].wickets += stats.wickets || 0;
          });
        }
      }

      // Calculate boundary percentage
      if (player.batting?.boundary_analysis) {
        const boundaryPercentage = player.batting.boundary_analysis.percentage || 0;
        totalBoundaries += boundaryPercentage;
      }

      // Get recent match stats
      const recentBattingMatches = player.batting?.matches?.slice(0, 5) || [];
      const recentBowlingMatches = player.bowling?.matches?.slice(0, 5) || [];

      recentMatches.push({
        name: player.name,
        matches: recentBattingMatches.map((match, idx) => ({
          runs: match.runs,
          wickets: recentBowlingMatches[idx]?.wickets || 0
        }))
      });
    });

    const avgBoundaryPercentage = playerIds.length > 0 ? 
      totalBoundaries / playerIds.length : 0;

    // Calculate phase-wise strike rates
    Object.keys(phaseStats).forEach(phase => {
      phaseStats[phase].strikeRate = phaseStats[phase].balls > 0 
        ? (phaseStats[phase].runs / phaseStats[phase].balls) * 100 
        : 0;
    });

    return {
      totalRuns,
      totalWickets,
      avgBoundaryPercentage,
      strikeRate: totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0,
      avgFantasyPoints: playerIds.length > 0 ? totalFantasyPoints / playerIds.length : 0,
      recentMatches,
      phaseStats
    };
  };

  const handleCompare = () => {
    if (team1Players.length > 0 && team2Players.length > 0) {
      setShowComparison(true);
    }
  };

  const renderComparisonIndicator = (value1, value2) => {
    if (value1 > value2) {
      return <TrendingUp className="text-green-500" size={16} />;
    } else if (value1 < value2) {
      return <TrendingDown className="text-red-500" size={16} />;
    }
    return <Minus className="text-gray-400" size={16} />;
  };

  const renderStatComparison = () => {
    const team1Stats = calculateTeamStats(team1Players);
    const team2Stats = calculateTeamStats(team2Players);

    return (
      <div className="bg-white rounded-lg p-6 mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 px-4">Metrics</th>
              <th className="text-center py-4 px-4">Team 1</th>
              <th className="text-center py-4 px-4">Comparison</th>
              <th className="text-center py-4 px-4">Team 2</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 font-medium">Total Runs</td>
              <td className="text-center py-4 px-4">{team1Stats.totalRuns}</td>
              <td className="text-center py-4 px-4">
                {renderComparisonIndicator(team1Stats.totalRuns, team2Stats.totalRuns)}
              </td>
              <td className="text-center py-4 px-4">{team2Stats.totalRuns}</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 font-medium">Total Wickets</td>
              <td className="text-center py-4 px-4">{team1Stats.totalWickets}</td>
              <td className="text-center py-4 px-4">
                {renderComparisonIndicator(team1Stats.totalWickets, team2Stats.totalWickets)}
              </td>
              <td className="text-center py-4 px-4">{team2Stats.totalWickets}</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 font-medium">Strike Rate</td>
              <td className="text-center py-4 px-4">{team1Stats.strikeRate.toFixed(2)}</td>
              <td className="text-center py-4 px-4">
                {renderComparisonIndicator(team1Stats.strikeRate, team2Stats.strikeRate)}
              </td>
              <td className="text-center py-4 px-4">{team2Stats.strikeRate.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 font-medium">Boundary %</td>
              <td className="text-center py-4 px-4">{team1Stats.avgBoundaryPercentage.toFixed(2)}%</td>
              <td className="text-center py-4 px-4">
                {renderComparisonIndicator(team1Stats.avgBoundaryPercentage, team2Stats.avgBoundaryPercentage)}
              </td>
              <td className="text-center py-4 px-4">{team2Stats.avgBoundaryPercentage.toFixed(2)}%</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 font-medium">Avg Fantasy Points</td>
              <td className="text-center py-4 px-4">{team1Stats.avgFantasyPoints.toFixed(2)}</td>
              <td className="text-center py-4 px-4">
                {renderComparisonIndicator(team1Stats.avgFantasyPoints, team2Stats.avgFantasyPoints)}
              </td>
              <td className="text-center py-4 px-4">{team2Stats.avgFantasyPoints.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderPhaseComparison = () => {
    const team1Stats = calculateTeamStats(team1Players);
    const team2Stats = calculateTeamStats(team2Players);
    const phases = ['powerplay', 'middle', 'death'];

    return (
      <div className="bg-white rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Phase-wise Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map(phase => (
            <div key={phase} className="border rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 capitalize">{phase} Phase</h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Metric</th>
                    <th className="text-center py-2 px-2">Team 1</th>
                    <th className="text-center py-2 px-2">Team 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Runs</td>
                    <td className="text-center">{team1Stats.phaseStats[phase].runs}</td>
                    <td className="text-center">{team2Stats.phaseStats[phase].runs}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Wickets</td>
                    <td className="text-center">{team1Stats.phaseStats[phase].wickets}</td>
                    <td className="text-center">{team2Stats.phaseStats[phase].wickets}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Strike Rate</td>
                    <td className="text-center">{team1Stats.phaseStats[phase].strikeRate.toFixed(2)}</td>
                    <td className="text-center">{team2Stats.phaseStats[phase].strikeRate.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentForm = () => {
    const team1Stats = calculateTeamStats(team1Players);
    const team2Stats = calculateTeamStats(team2Players);

    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Form (Last 5 Matches)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Team 1', stats: team1Stats },
            { name: 'Team 2', stats: team2Stats }
          ].map((team) => (
            <div key={team.name} className="border rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3">{team.name}</h4>
              {team.stats.recentMatches.map((player, playerIdx) => (
                <div key={playerIdx} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">{player.name}</h5>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 px-4">Match</th>
                        <th className="text-center py-2 px-4">Runs</th>
                        <th className="text-center py-2 px-4">Wickets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.matches.map((match, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4">Match {idx + 1}</td>
                          <td className="text-center py-2 px-4">{match.runs}</td>
                          <td className="text-center py-2 px-4">{match.wickets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Select Players</h3>
          <CheckTreePicker
            data={mockTreeData}
            onChange={setTeam1Players}
            style={{ width: '100%' }}
            placeholder="Select Team 1 Players"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Select Players</h3>
          <CheckTreePicker
            data={mockTreeData}
            onChange={setTeam2Players}
            style={{ width: '100%' }}
            placeholder="Select Team 2 Players"
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleCompare}
          disabled={!team1Players.length || !team2Players.length}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          Compare Players
        </button>
      </div>

      {showComparison && (
        <div className="space-y-6">
          {renderStatComparison()}
          {renderPhaseComparison()}
          {renderRecentForm()}
        </div>
      )}
    </div>
  );
};

export default PlayerComparison;