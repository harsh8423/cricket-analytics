import React from 'react';
import { TrendingUp, Award, MapPin, Users, TrendingDown, Trophy } from 'lucide-react';

const h2hData = {
  team1: "Mumbai Indians",
  team2: "Chennai Super Kings",
  lastFiveMatches: [
    {
      date: "2024-01-01",
      result: "MI won by 25 runs",
      score: "MI: 189/4 vs CSK: 164/8",
      topPerformerTeam1: { name: "R. Sharma", performance: "82(48)" },
      topPerformerTeam2: { name: "MS Dhoni", performance: "54(29)" }
    },
    {
      date: "2023-12-15",
      result: "CSK won by 6 wickets",
      score: "MI: 155/8 vs CSK: 156/4",
      topPerformerTeam1: { name: "H. Pandya", performance: "45(32)" },
      topPerformerTeam2: { name: "R. Jadeja", performance: "3/22" }
    },
    {
      date: "2023-11-30",
      result: "MI won by 8 wickets",
      score: "CSK: 145/9 vs MI: 146/2",
      topPerformerTeam1: { name: "J. Bumrah", performance: "4/25" },
      topPerformerTeam2: { name: "R. Gaikwad", performance: "48(36)" }
    },
    {
      date: "2023-11-15",
      result: "CSK won by 15 runs",
      score: "CSK: 178/5 vs MI: 163/8",
      topPerformerTeam1: { name: "SKY", performance: "71(44)" },
      topPerformerTeam2: { name: "D. Conway", performance: "86(52)" }
    },
    {
      date: "2023-11-01",
      result: "MI won by 5 wickets",
      score: "CSK: 169/7 vs MI: 170/5",
      topPerformerTeam1: { name: "T. David", performance: "65(31)" },
      topPerformerTeam2: { name: "D. Chahar", performance: "3/33" }
    }
  ],
  winPredictor: {
    team1: 55,
    team2: 45
  }
};


const WinPredictor = ({ team1, team2, team1Percentage }) => {
  const team2Percentage = 100 - team1Percentage;
  
  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-16 relative">
        {/* Left Side */}
        <div className="text-center w-1/3">
          <div className="flex justify-center mb-2">
            <Trophy 
              size={40} 
              className={`${team1Percentage >= 50 ? 'text-green-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="text-lg font-semibold mb-1">Higher match wins</div>
          <div className="h-1 w-24 mx-auto mt-2 rounded-full bg-green-400"></div>
        </div>

        {/* Right Side */}
        <div className="text-center w-1/3">
          <div className="flex justify-center mb-2">
            <Award 
              size={40} 
              className={`${team2Percentage > 50 ? 'text-red-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="text-lg font-semibold mb-1">Lower match wins</div>
          <div className="h-1 w-24 mx-auto mt-2 rounded-full bg-red-400"></div>
        </div>

        {/* Balance Scale */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-4">
          <div className="w-1 h-16 bg-gray-300 mx-auto"></div>
          <div className="w-48 h-1 bg-gray-300 -translate-y-1"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 absolute left-1/2 -translate-x-1/2 -translate-y-1"></div>
        </div>
      </div>

      {/* Team Names and Percentages */}
      {/* <div className="flex justify-between text-xl">
        <div className="w-1/3 text-center">
          <div className="font-bold">{team1}</div>
          <div className="text-gray-600">{team1Percentage}%</div>
        </div>
        <div className="w-1/3 text-center">
          <div className="font-bold">{team2}</div>
          <div className="text-gray-600">{team2Percentage}%</div>
        </div>
      </div> */}
    </div>
  );
};


export default function TeamH2H() {
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
        {h2hData.lastFiveMatches.map((match, idx) => (
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
        <WinPredictor
      team1="Chennai Super Kings"
      team2="Gujarat Titans"
      team1Percentage={35}
    />
      </div>
    </div>
  );
};
