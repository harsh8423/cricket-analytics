import React, { useState } from 'react';
import { ChevronDown, Activity, Target, AlertCircle } from 'lucide-react';

const OpponentCard = ({ name, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert wicket patterns to array format for rendering
  const wicketPatternsArray = Object.entries(data.wicket_patterns || {}).map(([pattern, count]) => {
    const [type, shot, line, length] = pattern.replace(/[()'"]/g, '').split(',').map(s => s.trim());
    return {
      type,
      shot,
      line,
      length,
      count
    };
  });

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
              {data.balls} balls faced
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{data.runs}</div>
            <div className="text-xs text-gray-500 mt-1">Runs Scored</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.strike_rate.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">Strike Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.wickets}</div>
            <div className="text-xs text-gray-500 mt-1">Wickets</div>
          </div>
        </div>

        {/* Wicket Analysis Button */}
        {data.wickets > 0 && wicketPatternsArray.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <span className="text-sm font-medium text-gray-700">Wicket Analysis</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Wicket Details */}
            <div className={`
              mt-2 overflow-hidden transition-all duration-300
              ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              {wicketPatternsArray.map((pattern, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Dismissal Type ({pattern.count} {pattern.count === 1 ? 'time' : 'times'})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-white rounded-md">
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="text-sm font-medium capitalize">{pattern.type}</div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-md">
                      <div className="text-xs text-gray-500">Shot</div>
                      <div className="text-sm font-medium capitalize">{pattern.shot}</div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-md">
                      <div className="text-xs text-gray-500">Line</div>
                      <div className="text-sm font-medium capitalize">{pattern.line}</div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-md">
                      <div className="text-xs text-gray-500">Length</div>
                      <div className="text-sm font-medium capitalize">{pattern.length}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OpponentAnalysis = ({ player }) => {
  // Extract opponent analysis from player data
  const opponentAnalysis = player?.batting?.opponent_analysis || {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Opponent Analysis</h2>
        <div className="text-sm text-gray-500">
          {Object.keys(opponentAnalysis).length} bowlers faced
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(opponentAnalysis).map(([name, bowlerData]) => (
          <OpponentCard key={name} name={name} data={bowlerData} />
        ))}
      </div>
    </div>
  );
};

export default OpponentAnalysis;