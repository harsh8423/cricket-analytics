import React, { useState, useEffect } from "react";
import ProgressBar from "../components/ProgressBar";
import { Button } from "rsuite";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ScoringZonesChart from "../components/ScoringZonesChart";
import OpponentAnalysis from "../components/OpponentAnalysis";

const PhaseAnalysis = ({ player }) => {
  // Transform phase stats data for the chart
  const transformPhaseData = () => {
    const battingPhases = player?.batting?.phase_stats || {};
    const bowlingPhases = player?.bowling?.phase_stats || {};
    
    return [
      {
        name: "Powerplay",
        runs: battingPhases.powerplay?.runs || 0,
        avgStrikeRate: battingPhases.powerplay?.strike_rate || 0,
        economy: bowlingPhases.powerplay?.economy || 0
      },
      {
        name: "Middle Overs",
        runs: battingPhases.middle?.runs || 0,
        avgStrikeRate: battingPhases.middle?.strike_rate || 0,
        economy: bowlingPhases.middle?.economy || 0
      },
      {
        name: "Death Overs",
        runs: battingPhases.death?.runs || 0,
        avgStrikeRate: battingPhases.death?.strike_rate || 0,
        economy: bowlingPhases.death?.economy || 0
      }
    ];
  };

  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} />
        <path
          d={`M ${x},${y} L ${x + width},${y} L ${x + width - 8},${y - 8} L ${x - 8},${y - 8} Z`}
          fill={fill}
          opacity={0.8}
        />
        <path
          d={`M ${x + width},${y} L ${x + width - 8},${y - 8} L ${x + width - 8},${y + height - 8} L ${x + width},${y + height} Z`}
          fill={fill}
          opacity={0.6}
        />
      </g>
    );
  };

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-4">Phase Analysis</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={transformPhaseData()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={{ strokeWidth: 2 }} />
          <YAxis yAxisId="left" axisLine={{ strokeWidth: 2 }} />
          <YAxis yAxisId="right" orientation="right" axisLine={{ strokeWidth: 2 }} />
          <Tooltip />
          <Bar
            yAxisId="left"
            dataKey="runs"
            name="Runs"
            fill="#8884d8"
            shape={<CustomBar />}
          />
          <Bar
            yAxisId="right"
            dataKey="avgStrikeRate"
            name="Strike Rate"
            fill="#82ca9d"
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TeamView = ({ isOpen, onRequestClose, player }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Transform matches data for performance comparison
  const getLast5Matches = () => {
    return (player?.batting?.matches || [])
      .filter(match => match.stats_type === "recent")
      .slice(0, 5)
      .map(match => ({
        match: `Match ${match.match_id}`,
        runs: match.runs,
        balls: match.balls,
        points: match.fantasy_points
      }));
  };

  const getLast5VenueMatches = () => {
    return (player?.batting?.matches || [])
      .filter(match => match.stats_type === "venue")
      .slice(0, 5)
      .map(match => ({
        match: `Match ${match.match_id}`,
        runs: match.runs,
        balls: match.balls,
        points: match.fantasy_points
      }));
  };

  // Transform fantasy points data
  const getFantasyPointsTrend = () => {
    return (player?.batting?.matches || [])
      .filter(match => match.stats_type === "recent")
      .map((match, index) => ({
        match: index + 1,
        points: match.fantasy_points,
        label: `Match ${match.match_id}`
      }));
  };

  // Transform batting control data
  const getBattingControl = () => {
    const control = player?.batting?.batting_control || {};
    return {
      inControl: (control["in-control"] || 0),
      noControl: (control["no-control"] || 0),
      beaten: (control.beaten || 0)
    };
  };

  // Transform boundary analysis data
  const getBoundaryStats = () => {
    const boundaryData = player?.batting?.boundary_analysis || {};
    return {
      percentage: boundaryData.percentage || 0
    };
  };

  // Transform scoring zones data
  const getScoringZones = () => {
    return (player?.batting?.scoring_zone || []).map(zone => ({
      area: zone.zone,
      runs: zone.runs,
      percentage: (zone.runs / player.batting.total_runs) * 100
    }));
  };

  return (
    <>
      <div>
        <div
          className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onRequestClose}
        />

        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 
            transition-all duration-300 ease-in-out
            ${isMobile ? 'w-full' : 'w-[calc(100%-300px)]'}
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{player?.name}</h2>
            <Button onClick={onRequestClose} variant="outline" size="sm">
              Close
            </Button>
          </div>

          <div className="p-6 bg-gray-100 h-[calc(100%-4rem)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Last 5 Matches</h4>
                    {getLast5Matches().map((match, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{match.match}</span>
                        <span className="font-medium">{match.runs} runs</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Last 5 at Venue</h4>
                    {getLast5VenueMatches().map((match, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{match.match}</span>
                        <span className="font-medium">{match.runs} runs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Batting Control</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <ProgressBar data={getBattingControl()} />
                </ResponsiveContainer>
                <h3 className="text-lg font-semibold">Boundary Analysis</h3>
                <div className="relative pt-4">
                  <div className="flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-8 border-indigo-500 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">
                          {getBoundaryStats().percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Boundary Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ScoringZonesChart player={player} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <PhaseAnalysis player={player} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-lg font-semibold mb-4">Fantasy Points Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getFantasyPointsTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="linear"
                    dataKey="points"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: "#4f46e5", r: 4 }}
                    label={{ position: "top", fill: "#6b7280", fontSize: 12 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <OpponentAnalysis player={player} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamView;