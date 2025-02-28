import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageSquare, Share2, ChevronRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { formatDistanceToNow } from 'date-fns';

const ReplyCard = ({ reply, onReply, onLike, currentUser, depth = 0, allReplies = [] }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const isLiked = reply.likes.includes(currentUser?._id);
  
  // Get direct child replies only
  const childReplies = allReplies.filter(r => r.parentReply === reply._id);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(reply._id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'pl-8 sm:pl-12' : ''} group`}>
      {/* Thread line connector */}
      {depth > 0 && (
        <div 
          className="absolute left-[18px] sm:left-[26px] top-0 w-[2px] bg-gray-200 group-hover:bg-gray-300 transition-colors"
          style={{ 
            height: '100%',
            top: '-12px'
          }}
        />
      )}
      
      <div className="relative">
        {/* Horizontal thread connector */}
        {depth > 0 && (
          <div 
            className="absolute left-[-28px] sm:left-[-38px] top-[24px] h-[2px] w-[28px] sm:w-[38px] bg-gray-200 group-hover:bg-gray-300 transition-colors"
          />
        )}

        <div className="py-3">
          {/* Author Info & Content */}
          <div className="flex items-start gap-3">
            <img 
              src={reply.author.picture} 
              alt="" 
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-[15px] text-gray-900">
                  {reply.author.name}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {/* Reply Content */}
              <div className="text-[15px] text-gray-800 mb-2">
                {reply.content}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-sm">
                <button 
                  onClick={() => onLike(reply._id)}
                  className={`flex items-center gap-1.5 ${
                    isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className="w-[18px] h-[18px]" 
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  <span className="text-sm">{reply.likes.length}</span>
                </button>

                <button 
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 pl-11">
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 text-[15px] bg-gray-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyInput(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {childReplies.length > 0 && (
        <div className="space-y-1">
          {childReplies.map(childReply => (
            <ReplyCard
              key={childReply._id}
              reply={childReply}
              onReply={onReply}
              onLike={onLike}
              currentUser={currentUser}
              depth={depth + 1}
              allReplies={allReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DiscussionDetail() {
  const { id } = useParams();
  const { isAuthenticated, user, token, axiosInstance } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await axiosInstance.get(`https://cricket-analytics-node.onrender.com/api/discussions/detail/${id}`);
      setDiscussion(response.data);
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (type, itemId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `https://cricket-analytics-node.onrender.com/api/discussions/${type === 'discussion' ? id : `${id}/replies/${itemId}`}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (type === 'discussion') {
        setDiscussion(prev => ({
          ...prev,
          likes: response.data.likes
        }));
      } else {
        setDiscussion(prev => ({
          ...prev,
          replies: prev.replies.map(reply => 
            reply._id === itemId ? { ...reply, likes: response.data.likes } : reply
          )
        }));
      }
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleReply = async (parentReplyId = null, content) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `https://cricket-analytics-node.onrender.com/api/discussions/${id}/replies`,
        {
          content: content || replyContent,
          parentReplyId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDiscussion(prev => ({
        ...prev,
        replies: [...prev.replies, response.data]
      }));
      setReplyContent('');
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get only top-level replies
  const topLevelReplies = discussion?.replies?.filter(reply => !reply.parentReply);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/community" className="hover:text-blue-500">Discussions</Link>
        <ChevronRight className="w-4 h-4" />
        <span>Post</span>
      </div>

      {/* Main Discussion */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={discussion?.author?.picture} 
            alt="" 
            className="w-10 h-10 rounded-full ring-2 ring-gray-100"
          />
          <div>
            <div className="font-medium text-gray-900">{discussion?.author?.name}</div>
            <div className="text-sm text-gray-500">
              {discussion?.createdAt ? 
                formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true }) 
                : 'Date not available'
              }
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{discussion?.title}</h1>
        
        <div className="prose prose-sm max-w-none mb-6">
          {discussion?.content}
        </div>

        <div className="flex items-center gap-6 text-gray-500">
          <button 
            onClick={() => handleLike('discussion', null)}
            className={`flex items-center gap-2 ${
              discussion?.likes?.includes(user?._id) ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <Heart 
              className="w-5 h-5" 
              fill={discussion?.likes?.includes(user?._id) ? "currentColor" : "none"}
            />
            <span>{discussion?.likes?.length}</span>
          </button>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>{discussion?.replies?.length}</span>
          </div>

          <button className="flex items-center gap-2 hover:text-blue-500">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Reply Input */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-3">
            <img 
              src={user?.picture} 
              alt="" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleReply()}
                  disabled={!replyContent.trim()}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      <div className="space-y-4">
        {topLevelReplies?.map(reply => (
          <ReplyCard
            key={reply._id}
            reply={reply}
            onReply={handleReply}
            onLike={(replyId) => handleLike('reply', replyId)}
            currentUser={user}
            depth={0}
            allReplies={discussion?.replies}
          />
        ))}
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}