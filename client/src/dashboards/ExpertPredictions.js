import React, { useState } from 'react';
import { Search, ArrowUp, MessageCircle, Filter } from 'lucide-react';

const predictions = [
  {
    id: 1,
    content: "Based on recent form and pitch conditions at MCG, India has a 70% chance of winning. Expecting Virat Kohli to score big given his excellent record against Australia.",
    predictor: "Michael Clarke",
    correctness: 80,
    status: "live",
    upvotes: 245,
    timestamp: "2h ago"
  },
  {
    id: 2,
    content: "The toss will be crucial. Team batting first has advantage in day-night matches at Lords. England's bowling attack looks stronger in these conditions.",
    predictor: "Nasser Hussain",
    correctness: 26,
    status: "completed",
    upvotes: 189,
    timestamp: "5h ago"
  },
  {
    id: 3,
    content: "South Africa's pace attack will be the key factor. Expecting a low-scoring match with bowlers dominating throughout.",
    predictor: "Shaun Pollock",
    correctness: 65,
    status: "upcoming",
    upvotes: 156,
    timestamp: "1h ago"
  },
  {
    id: 4,
    content: "New Zealand's recent record at Eden Park suggests they have the upper hand. Kane Williamson's form will be crucial for their batting performance.",
    predictor: "Ian Smith",
    correctness: 45,
    status: "completed",
    upvotes: 123,
    timestamp: "3h ago"
  }
];

const ExpertPredictions = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12 text-center px-2">
        <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 sm:mb-4">
          Expert Match Predictions
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Insights from cricket experts and analysts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8 px-2">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search predictions..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Filter Buttons - Horizontal Scrollable on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            {['all', 'live', 'upcoming', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-2 transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter === 'live' && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2">
        {predictions.map((prediction) => (
          <div 
            key={prediction.id}
            className="bg-white rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:border-indigo-100"
          >
            {/* Header with Predictor Info and Status */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                  {prediction.predictor.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">{prediction.predictor}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{prediction.timestamp}</div>
                </div>
              </div>
              <div 
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                  ${prediction.status === 'live' ? 'bg-green-100 text-green-700' : 
                    prediction.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'}`}
              >
                {prediction.status === 'live' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                {prediction.status.toUpperCase()}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                {prediction.content}
              </p>

              {/* Prediction Result */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-grow bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        prediction.correctness >= 60 
                          ? 'bg-gradient-to-r from-green-400 to-green-500' 
                          : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${prediction.correctness}%` }}
                    ></div>
                  </div>
                  <span 
                    className={`text-sm sm:text-base font-semibold ${
                      prediction.correctness >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {prediction.correctness}% Correct
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200">
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                    Upvote • {prediction.upvotes}
                  </span>
                </button>
                <button 
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg sm:rounded-xl transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Discuss</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpertPredictions;