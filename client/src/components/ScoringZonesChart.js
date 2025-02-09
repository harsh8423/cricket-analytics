import React, { useMemo } from 'react';

const ScoringZonesChart = ({ player }) => {
  // Calculate total runs to get percentages
  const totalRuns = useMemo(() => {
    if (!player?.batting?.scoring_zone) return 0;
    return player.batting.scoring_zone.reduce((sum, zone) => sum + zone.runs, 0);
  }, [player]);

  // Process scoring zones data
  const scoringZones = useMemo(() => {
    if (!player?.batting?.scoring_zone) return [];
    
    // Map zones to expected format with calculated percentages
    return player.batting.scoring_zone.map(zone => ({
      area: zone.zone.charAt(0).toUpperCase() + zone.zone.slice(1), // Capitalize first letter
      runs: zone.runs,
      percentage: ((zone.runs / totalRuns) * 100).toFixed(1)
    }));
  }, [player, totalRuns]);

  const getOpacityForRuns = (runs) => {
    const maxRuns = Math.max(...scoringZones.map(zone => zone.runs));
    return 0.3 + (runs / maxRuns) * 0.7;
  };

  // Calculate position for text in the middle of each arc segment
  const getTextPosition = (startAngle, endAngle, radius) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const x = Math.cos(midAngle) * radius;
    const y = Math.sin(midAngle) * radius;
    return { x, y };
  };

  if (!player?.batting?.scoring_zone || scoringZones.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Scoring Zones</h3>
        <p className="text-gray-500">No scoring zone data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-lg font-semibold mb-4">Scoring Zones</h3>
      <div className="relative w-full" style={{ height: '400px' }}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <g transform="translate(200, 200)">
            {scoringZones.map((zone, index) => {
              const startAngle = index * (360 / scoringZones.length);
              const endAngle = (index + 1) * (360 / scoringZones.length);
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              const x1 = Math.cos(startRad) * 180;
              const y1 = Math.sin(startRad) * 180;
              const x2 = Math.cos(endRad) * 180;
              const y2 = Math.sin(endRad) * 180;

              // Calculate text position
              const textPos = getTextPosition(startAngle, endAngle, 90);

              return (
                <g key={zone.area}>
                  <path
                    d={`M 0 0 L ${x1} ${y1} A 180 180 0 0 1 ${x2} ${y2} Z`}
                    fill="#16a34a"
                    fillOpacity={getOpacityForRuns(zone.runs)}
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  {/* Background for better text readability */}
                  <circle 
                    cx={textPos.x} 
                    cy={textPos.y} 
                    r="24" 
                    fill="white" 
                    fillOpacity="0.8"
                  />
                  
                  {/* Zone Area Text */}
                  <text
                    x={textPos.x}
                    y={textPos.y - 8}
                    textAnchor="middle"
                    fill="#1f2937"
                    className="text-xs font-medium"
                    style={{ pointerEvents: 'none' }}
                  >
                    {zone.area}
                  </text>
                  
                  {/* Percentage Text */}
                  <text
                    x={textPos.x}
                    y={textPos.y + 8}
                    textAnchor="middle"
                    fill="#4b5563"
                    className="text-xs"
                    style={{ pointerEvents: 'none' }}
                  >
                    {zone.percentage}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ScoringZonesChart;