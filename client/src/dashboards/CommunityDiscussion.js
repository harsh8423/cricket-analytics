import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MessageSquare, Heart, Share2, ExternalLink, MoreHorizontal} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import CreatePostModal from '../components/CreatePostModal';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CommunityDiscussion = () => {
  const [selectedTag, setSelectedTag] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, token, axiosInstance } = useAuth();

  const {match_id} = useParams();
  
  const tags = [
    { id: 'latest', label: 'Latest', color: 'indigo' },
    { id: 'trending', label: 'Trending', color: 'pink' },
    { id: 'prediction', label: 'Predictions', color: 'blue' },
    { id: 'stats', label: 'Statistics', color: 'green' },
    { id: 'question', label: 'Questions', color: 'purple' },
    { id: 'ai_team', label: 'AI Teams', color: 'orange' }
  ];
  
  const [allPosts, setAllPosts] = useState([]); // Store all posts for client-side filtering
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  useEffect(() => {
    fetchAllPosts();
  }, []);


  
  useEffect(() => {
    // Handle click outside search dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchAllPosts = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:8000/api/discussions/${match_id}`);
      setAllPosts(response.data);
      setFilteredPosts(response.data);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  // Client-side search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    return allPosts
      .filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.reference.content.toLowerCase().includes(query)
      )
      .slice(0, 5); // Limit to 5 suggestions
  }, [searchQuery, allPosts]);
  
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `http://localhost:8000/api/discussions/search?q=${encodeURIComponent(searchQuery)}`
      );
      setFilteredPosts(response.data);
      setShowSearchDropdown(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch posts and apply tag filtering
  useEffect(() => {
    const fetchAndFilterPosts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`http://localhost:8000/api/discussions/${match_id}`);
        const allPosts = response.data;

        // Apply filtering based on selected tag
        let filteredPosts;
        switch (selectedTag) {
          case 'trending':
            filteredPosts = [...allPosts].sort((a, b) => 
              (b.likes?.length || 0) - (a.likes?.length || 0)
            );
            break;
          case 'latest':
            filteredPosts = [...allPosts].sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          default:
            // Filter by reference type for other tags
            filteredPosts = allPosts.filter(post => 
              post.reference?.type === selectedTag
            );
            break;
        }

        console.log('Selected Tag:', selectedTag); // Debug log
        console.log('Filtered Posts:', filteredPosts); // Debug log
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterPosts();
  }, [selectedTag]); // Dependency on selectedTag to refetch when tag changes

  const handleTagClick = (tagId) => {
    console.log('Clicking tag:', tagId); // Debug log
    setSelectedTag(tagId);
    setShowSearchDropdown(false); // Close search dropdown when changing tags
  };
  
  const handleCreatePost = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };
  
  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const response = await axios.post(
        `http://localhost:8000/api/discussions/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
        ? { ...post, likes: response.data.likes }
        : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleShare = async (post) => {
    try {
      await navigator.share({
        title: post.title,
        text: `Check out this discussion: ${post.title}`,
        url: `${window.location.origin}/discussions/${post._id}`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleSubmitPost = async (postData) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/discussions', 
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setPosts([response.data, ...posts]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 403) {
        setShowAuthModal(true);
      }
    }
  };
  
  const referenceTypeColors = {
    prediction: { bg: 'bg-blue-100', text: 'text-blue-700' },
    stats: { bg: 'bg-green-100', text: 'text-green-700' },
    question: { bg: 'bg-purple-100', text: 'text-purple-700' },
    ai_team: { bg: 'bg-orange-100', text: 'text-orange-700' }
  };
 
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar with Autocomplete */}
        <div className="sticky top-0 z-10 bg-gray-100 pt-2 pb-4">
          <div className="relative mb-6" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-4 pr-4 py-3 text-base rounded-l-xl bg-transparent outline-none border-none focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />
              </div>

              <div className="flex items-center">
                <button 
                  type="submit"
                  className="px-4 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
                <div className="h-8 w-px bg-gray-200"></div>
                <button 
                  onClick={handleCreatePost}
                  className="px-4 py-1.5 mx-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                {searchSuggestions.map(post => (
                  <div
                    key={post._id}
                    onClick={() => {
                      navigate(`/discussions/${post._id}`);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="group p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author.picture} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">{post.content}</p>
                        {post.reference?.content && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            Reference: {post.reference.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  selectedTag === tag.id
                    ? `bg-${tag.color}-600 text-white shadow-md scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
  
        {/* Discussion List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts found for this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div 
                key={post._id} 
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={post.author.picture} 
                    alt="" 
                    className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {post.author.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
  
                {/* Post Content */}
                <div 
                  onClick={() => navigate(`/discussions/${post._id}`)}
                  className="cursor-pointer"
                >
                  <h2 className="text-lg font-semibold mb-3 text-gray-900">
                    {post.title}
                  </h2>
  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        referenceTypeColors[post.reference.type].bg
                      } ${referenceTypeColors[post.reference.type].text}`}
                    >
                      {post.reference.type.charAt(0).toUpperCase() + post.reference.type.slice(1)}
                    </span>
                  </div>
  
                  {/* Reference Link */}
                  {post.reference && (
                    <a
                      href={post.reference.link}
                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 mb-4 hover:bg-gray-100 transition-colors group"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate">
                        {post.reference.content}
                      </span>
                    </a>
                  )}
  
                  {/* Top Comments */}
                  <TopComments comments={post.replies} />
                </div>
  
                {/* Engagement Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post._id);
                    }}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      post.likes.includes(user?._id) 
                        ? 'text-red-500' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className="w-5 h-5" 
                      fill={post.likes.includes(user?._id) ? "currentColor" : "none"}
                    />
                    <span className="font-medium text-sm">{post.likes.length}</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/discussions/${post._id}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium text-sm">{post.replies?.length || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium text-sm">Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {showCreateModal && (
          <CreatePostModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleSubmitPost}
          />
        )}
  
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            if (showCreateModal) {
              setShowCreateModal(true);
            }
          }}
        />
      </div>
    </div>
  );
};

const TopComments = ({ comments }) => {
  if (!comments || comments.length === 0) return null;

  const sortedComments = [...comments]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 2);

  return (
    <div className="space-y-2">
      {sortedComments.map(comment => (
        <div key={comment._id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm">
          <img 
            src={comment.author.picture} 
            alt="" 
            className="w-5 h-5 rounded-full"
          />
          <span className="font-medium text-gray-900">{comment.author.name}:</span>
          <p className="text-gray-600 truncate flex-1">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommunityDiscussion;