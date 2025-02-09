import React, { useState } from 'react';
import { Search, MessageSquare, Heart, Share2, ExternalLink } from 'lucide-react';

const dummyPosts = [
  {
    id: 1,
    title: "Impact of Bumrah's bowling variations in death overs",
    tags: ["analysis", "bowling", "prediction"],
    author: {
      name: "Rahul Dev",
      avatar: "/api/placeholder/32/32"
    },
    timeAgo: "2 hours ago",
    views: "12,324",
    likes: "1,245",
    comments: "86",
    reference: {
      type: "stats",
      title: "Bumrah's Death Over Statistics 2023-24",
      link: "/stats/bowlers/bumrah/death-overs"
    },
    topReplies: [
      {
        author: "Cricket Expert",
        text: "His yorker accuracy in the last 5 overs is unprecedented..."
      },
      {
        author: "Stats Analyst",
        text: "The data shows his economy rate drops by 2.3 runs in clutch situations..."
      }
    ]
  },
  // ... other dummy posts
];

const CommunityDiscussion = () => {
  const [selectedTag, setSelectedTag] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

  const tags = [
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'prediction', label: 'Predictions' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'stats', label: 'Statistics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        {/* Search Bar */}
        <div className="relative mb-3 sm:mb-6">
          <input
            type="text"
            placeholder="Search discussions..."
            className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-3 sm:mb-6 overflow-x-auto pb-1.5 scrollbar-hide">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap flex-shrink-0 ${
                selectedTag === tag.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-4 border border-gray-200">
          <img src="/api/placeholder/32/32" alt="User avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
          <input
            type="text"
            placeholder="Start a discussion..."
            className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap">
            Create Post
          </button>
        </div>

        {/* Discussion List */}
        <div className="space-y-3 sm:space-y-4">
          {dummyPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{post.author.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{post.timeAgo}</p>
                </div>
              </div>

              <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">{post.title}</h2>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-gray-100 text-xs sm:text-sm text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Reference Link */}
              <a
                href={post.reference.link}
                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-50 mb-3 sm:mb-4 hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">{post.reference.title}</span>
              </a>

              {/* Top Replies */}
              <div className="space-y-2 mb-3 sm:mb-4">
                {post.topReplies.map((reply, index) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-600 pl-3 border-l-2 border-gray-200">
                    <span className="font-medium text-gray-900">{reply.author}:</span> {reply.text}
                  </div>
                ))}
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Share
                </button>
                <span className="flex items-center gap-1 ml-auto">
                  {post.views} views
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityDiscussion;