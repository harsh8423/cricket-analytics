import React from 'react';
import { Newspaper, Star, Lightbulb, TrendingUp, ExternalLink } from 'lucide-react';

// Sample data structure
const topNews = {
  news: [
    {
      id: 1,
      type: "news",
      title: "Virat Kohli's Masterclass: Breaking Down the Perfect Cover Drive",
      content: "An in-depth analysis of Kohli's technique that led to his magnificent century against Australia...",
      source: "ESPNcricinfo",
      timestamp: "2 hours ago",
      category: "Analysis"
    },
    {
      id: 2,
      type: "tip",
      title: "Match Day Tip: Dew Factor at Eden Gardens",
      content: "Evening conditions suggest heavy dew expected after 7 PM. Teams choosing to bowl first might have an advantage...",
      source: "Cricket Expert Panel",
      timestamp: "4 hours ago",
      category: "Pre-Match Tips"
    },
    {
      id: 3,
      type: "fact",
      title: "Historical Record Alert",
      content: "This venue has seen the highest successful run chase in T20 history. The record stands at 223/3...",
      source: "Cricket Statistics",
      timestamp: "1 day ago",
      category: "Match Facts"
    },
    {
      id: 4,
      type: "news",
      title: "Team Changes: Last Minute Updates",
      content: "Both teams have made strategic changes to their playing XI. Key players return from injury...",
      source: "Cricket Updates Live",
      timestamp: "30 min ago",
      category: "Discussion"
    }
  ]
};

const getIconForType = (type) => {
  switch (type) {
    case 'news':
      return <Newspaper className="w-5 h-5" />;
    case 'tip':
      return <Lightbulb className="w-5 h-5" />;
    case 'fact':
      return <Star className="w-5 h-5" />;
    default:
      return <TrendingUp className="w-5 h-5" />;
  }
};

const getColorForType = (type) => {
  switch (type) {
    case 'news':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'tip':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'fact':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const NewsCard = ({ item }) => {
  const colorClass = getColorForType(item.type);
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="p-6 space-y-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center px-3 py-1 rounded-full space-x-2 ${colorClass}`}>
            {getIconForType(item.type)}
            <span className="text-sm font-medium capitalize">{item.category}</span>
          </div>
          <span className="text-xs text-gray-500">{item.timestamp}</span>
        </div>

        {/* Title and Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {item.content}
          </p>
        </div>

        {/* Source */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Source:</span>
            <span className="text-sm font-medium text-gray-700">{item.source}</span>
          </div>
          <button className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TopNews = ({ data = topNews }) => {
  return (
    <div className="space-y-2 bg rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Top News & Updates</h2>
          <p className="text-sm text-gray-500">Latest insights, tips, and match facts</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium">
          View All
        </button>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default TopNews;