import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import TeamDisplay from '../components/TeamDisplay';
import axios from 'axios';
import { FaTrash, FaCrown, FaStar, FaUsers, FaEdit, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

export default function SavedTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

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
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    } else {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);
  
  const fetchTeams = async () => {
    console.log("match_id", match_id);
    try {
      const response = await axios.get(`https://cricket-analytics-node.onrender.com/api/ai-teams/user-teams/${match_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await axios.delete(`https://cricket-analytics-node.onrender.com/api/ai-teams/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTeams(teams.filter(team => team._id !== teamId));
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleEditTeam = (team) => {
    navigate(`/dashboard/${team1_name}vs${team2_name}/fantasy`, {
      state: {
        editData: {
          teamData: {
            teams: [{
              team: team.team,
            }],
            strategies: team.strategies
          }
        }
      }
    });
  };

  const TeamViewModal = ({ team, onClose, onEdit, onDelete }) => {
    if (!team) return null;

    const formattedTeamData = {
      teams: [{
        team: team.team
      }],
      strategies: team.strategies
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-gradient-to-b from-green-800 to-green-600 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>

          <TeamDisplay 
            teamData={formattedTeamData} 
            currentTeamIndex={0}
            onPlayerClick={() => {}} 
          />

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <FaEdit /> Edit Team
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <FaTrash /> Delete Team
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Teams</h1>
            <p className="text-green-100">Manage your fantasy teams and make changes anytime</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <FaUsers className="text-2xl text-green-300" />
            <span className="text-white font-semibold">{teams.length} Teams</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div 
              key={team._id} 
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/20"
              onClick={() => {
                setSelectedTeam(team);
                setShowTeamModal(true);
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 text-green-300 rounded-full w-12 h-12 flex items-center justify-center font-bold backdrop-blur-sm">
                      T{team._id.slice(-2)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Team {team._id.slice(-2)}</h2>
                      <p className="text-sm text-green-200">
                        {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team);
                      }}
                      className="text-green-200 hover:text-white hover:bg-green-500/20 p-2 rounded-lg transition-colors duration-200"
                      title="Edit Team"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(team._id);
                      }}
                      className="text-red-200 hover:text-white hover:bg-red-500/20 p-2 rounded-lg transition-colors duration-200"
                      title="Delete Team"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <FaCrown className="text-yellow-400 text-xl" />
                    <div>
                      <p className="text-green-200 text-sm">Captain</p>
                      <p className="text-white font-semibold truncate">
                        {team.team.find(p => p.is_captain)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <FaStar className="text-yellow-400 text-xl" />
                    <div>
                      <p className="text-green-200 text-sm">Vice Captain</p>
                      <p className="text-white font-semibold truncate">
                        {team.team.find(p => p.is_vice_captain)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showTeamModal && selectedTeam && (
        <TeamViewModal 
          team={selectedTeam}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedTeam(null);
          }}
          onEdit={() => {
            handleEditTeam(selectedTeam);
            setShowTeamModal(false);
          }}
          onDelete={() => {
            handleDelete(selectedTeam._id);
            setShowTeamModal(false);
          }}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}