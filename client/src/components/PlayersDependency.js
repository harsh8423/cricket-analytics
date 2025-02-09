import React from 'react';

const PlayersDependency = () => {
  // Sample data
  const data = [
    ['Virat', 'Chahal', 45, 2, 34],
    ['Virat', 'Bumrah', 65, 1, 54],
    ['Dhoni', 'Bumrah', 25, 0, 12],
    ['Dhoni', 'Kumar', 25, 0, 12],
    ['Dhoni', 'Starc', 25, 0, 12],
    ['Rohit', 'Starc', 35, 1, 28],
    ['Rohit', 'Chahal', 35, 1, 28],
    ['Rohit', 'Kumar', 35, 1, 28],
    ['Maxwell', 'Shami', 55, 2, 42],
    ['Smith', 'Kumar', 28, 1, 24]
  ];

  // Process data to get unique players
  const team1Players = [...new Set(data.map(d => d[0]))];
  const team2Players = [...new Set(data.map(d => d[1]))];

  // Calculate the maximum runs for scaling
  const maxRuns = Math.max(...data.map(d => d[2]));

  // Calculate positions
  const spacing = 60;
  const team1StartY = 100;
  const team2StartY = 100;
  const svgHeight = Math.max(team1Players.length, team2Players.length) * spacing + 200;

  // Generate a color based on runs and wickets
  const getPathColor = (runs, wickets) => {
    const intensity = (runs / maxRuns) * 255;
    return wickets > 0 ? 
      `rgba(255, ${155 - intensity * 0.5}, ${155 - intensity * 0.5}, 0.4)` : 
      `rgba(${155 - intensity * 0.5}, ${155 - intensity * 0.5}, 255, 0.4)`;
  };

  // Calculate path thickness based on balls faced
  const getPathWidth = (balls) => {
    return (balls / 60) * 5 + 1;
  };

  return (
    <div className="w-full overflow-x-auto p-4">
      <svg width="1000" height={svgHeight} className="mx-auto">
        {/* Title */}
        <text x="500" y="50" textAnchor="middle" className="text-2xl font-bold">
          Player Interactions Analysis
        </text>

        {/* Team 1 Players */}
        <g>
          {team1Players.map((player, idx) => (
            <g key={`team1-${player}`}>
              <circle 
                cx="200" 
                cy={team1StartY + idx * spacing} 
                r="25" 
                className="fill-blue-500"
              />
              <text 
                x="200" 
                y={team1StartY + idx * spacing} 
                textAnchor="middle" 
                dy=".3em" 
                className="fill-white font-medium text-sm"
              >
                {player}
              </text>
            </g>
          ))}
        </g>

        {/* Team 2 Players */}
        <g>
          {team2Players.map((player, idx) => (
            <g key={`team2-${player}`}>
              <circle 
                cx="800" 
                cy={team2StartY + idx * spacing} 
                r="25" 
                className="fill-red-500"
              />
              <text 
                x="800" 
                y={team2StartY + idx * spacing} 
                textAnchor="middle" 
                dy=".3em" 
                className="fill-white font-medium text-sm"
              >
                {player}
              </text>
            </g>
          ))}
        </g>

        {/* Connection Paths */}
        {data.map((interaction, idx) => {
          const [batter, bowler, runs, wickets, balls] = interaction;
          const startY = team1StartY + team1Players.indexOf(batter) * spacing;
          const endY = team2StartY + team2Players.indexOf(bowler) * spacing;
          
          // Create curved path
          const path = `M 225 ${startY} C 500 ${startY}, 500 ${endY}, 775 ${endY}`;
          
          return (
            <g key={`path-${idx}`} className="group">
              <path
                d={path}
                fill="none"
                stroke={getPathColor(runs, wickets)}
                strokeWidth={getPathWidth(balls)}
                className="transition-all duration-300 hover:opacity-100"
              />
              
              {/* Hover information */}
              <text>
                <textPath href={`#hover-${idx}`} startOffset="50%" textAnchor="middle">
                  <tspan className="fill-gray-700 text-xs opacity-0 group-hover:opacity-100">
                    {`${runs} runs, ${wickets} wickets, ${balls} balls`}
                  </tspan>
                </textPath>
              </text>
              {/* Hidden path for text alignment */}
              <path
                id={`hover-${idx}`}
                d={path}
                fill="none"
                className="opacity-0"
              />
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(400, 20)">
          <circle cx="0" cy="0" r="10" className="fill-blue-500" />
          <text x="15" y="5" className="text-sm">Team 1 Batsmen</text>
          <circle cx="150" cy="0" r="10" className="fill-red-500" />
          <text x="165" y="5" className="text-sm">Team 2 Bowlers</text>
        </g>
      </svg>
    </div>
  );
};

export default PlayersDependency;