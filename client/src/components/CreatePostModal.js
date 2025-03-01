import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';

const CreatePostModal = ({ isOpen, onClose, onSubmit, rt,rc }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [referenceType, setReferenceType] = useState('prediction');
  const [referenceContent, setReferenceContent] = useState('');

  const { teamname, match_id } = useParams();

  const [team1_name, setteam1_name] = useState(null)
  const [team2_name, setteam2_name] = useState(null)
  
  useEffect(() => {
    const extractTeams = (teamInfo) => {
      if (!teamInfo) return { team1: "", team2: "" };
      
      const teams = teamInfo.split("vs");
      const team1 = teams[0]?.replace(/%20/g, " ").trim();
      const team2 = teams[1]?.replace(/%20/g, " ").trim();
      
      setteam1_name(team1);
      setteam2_name(team2);
      console.log("team1_name",team1_name, "team2_name", team2_name);
    };
    extractTeams(teamname);
    
  }, [teamname])

  const referenceTypes = [
    { id: 'prediction', label: 'Prediction', color: 'blue' },
    { id: 'stats', label: 'Stats', color: 'green' },
    { id: 'question', label: 'Question', color: 'purple' },
    { id: 'ai_team', label: 'AI Team', color: 'orange' },
  ];

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setTitle(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      reference: {
        type: rt? rt:referenceType,
        content: rc? rc: `${team1_name} vs ${team2_name}`
      },
      match_id: match_id
    };

    await onSubmit(postData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create Discussion</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title with character count */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-gray-500 text-xs">({50 - title.length} characters remaining)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                maxLength={50}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Reference Type Buttons */}
            <div>
              <label className="block text-sm font-medium mb-2">Post Type</label>
              <div className="flex flex-wrap gap-2">
                {referenceTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setReferenceType(type.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      referenceType === type.id
                        ? `bg-${type.color}-100 text-${type.color}-700 scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg min-h-[200px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your post content here..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;