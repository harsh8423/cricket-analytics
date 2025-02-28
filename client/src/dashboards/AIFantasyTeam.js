import { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaList, FaSearch} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TeamDisplay from '../components/TeamDisplay';


const SearchBar = ({ query, setQuery, onSearch, isEditMode }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isEditMode ? "Ask AI to modify team (e.g., 'Add more spinners')..." : "Ask AI to generate team (e.g., 'Create balanced team for rainy conditions')..."}
          className={`w-full py-3 px-6 pr-12 rounded-full border-2 focus:outline-none focus:ring-2 focus:border-transparent shadow-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 ${
            isEditMode 
              ? 'border-purple-500 focus:ring-purple-500' 
              : 'border-blue-500 focus:ring-blue-500'
          }`}
        />
        <button 
          onClick={handleSubmit}
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          disabled={!query.trim()}
        >
          <FaSearch className={`w-5 h-5 ${
            isEditMode ? 'text-purple-500' : 'text-blue-500'
          } ${!query.trim() ? 'opacity-50' : ''}`} />
        </button>
      </form>
    </div>
  );
};


const StrategySection = ({ strategies }) => {
  if (!strategies) return null;

  return (
    <div className="mt-8 bg-white/90 rounded-lg p-4">
      <h2 className="text-lg font-bold text-green-900 mb-3">Match Strategy</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 p-3 rounded-lg">
          <h3 className="font-bold text-sm">Pace/Spin Ratio</h3>
          <p className="text-sm">{strategies.pace_spin_ratio}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <h3 className="font-bold text-sm">Batting Order</h3>
          <p className="text-sm">{strategies.batting_order}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg">
          <h3 className="font-bold text-sm">Venue Adjustments</h3>
          <ul className="list-disc pl-4 text-sm">
            {strategies.venue_adjustments?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FantasyTeam = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [query, setQuery] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Check if we're coming from saved teams or discussion edit
  useEffect(() => {
    const editData = location.state?.editData;
    console.log("Edit Data received:", editData); // Debug log

    if (editData?.teamData) {
      console.log("Setting edit mode with team data:", editData.teamData);
      setIsEditMode(true);
      setTeamData(editData.teamData);
      setEditingTeamId(editData.teamId); // Store the ID of the team being edited
      setQuery('How should I modify this team?');
    }
  }, [location.state]);

  // Modified handleSearch to handle individual team editing
  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a query before searching");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://cricket-analytics.onrender.com/api/fantasy/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          match_id,
          existing_team: isEditMode ? teamData.teams[currentTeamIndex].team : null,
          is_editing: isEditMode,
          total_teams: teamData?.teams?.length || 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate team');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // If editing a team within multiple teams, update only that specific team
      if (isEditMode && teamData?.teams?.length > 1) {
        const updatedTeams = [...teamData.teams];
        updatedTeams[currentTeamIndex] = data.teams[0];
        setTeamData({
          ...teamData,
          teams: updatedTeams,
          strategies: data.strategies
        });
      } else {
        // For new teams or single team edit, use the complete response
        setTeamData(data);
      }
      
      setQuery('');
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add debug logging in the render method
  useEffect(() => {
    console.log("Current teamData:", teamData);
    console.log("Is Edit Mode:", isEditMode);
  }, [teamData, isEditMode]);

  // Modified handleEditMode to handle both toggle and initial edit state
  const handleEditMode = () => {
    if (!teamData?.teams?.[0]?.team) {
      setError("No team to edit. Generate a team first.");
      return;
    }
    setIsEditMode(!isEditMode);
    setQuery(isEditMode ? '' : 'How should I modify this team?');
  };
  

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleSaveTeam = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!teamData?.teams?.[0]?.team) {
      alert('No team data to save!');
      return;
    }

    try {
      const dataToSave = {
        team: teamData.teams[0].team,
        strategies: teamData.strategies || {},
      };

      let response;
      if (editingTeamId) {
        // Update existing team
        response = await axios.put(
          `https://cricket-analytics-node.onrender.com/api/ai-teams/${editingTeamId}`,
          dataToSave,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new team
        response = await axios.post(
          'https://cricket-analytics-node.onrender.com/api/ai-teams',
          dataToSave,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Show success message
      alert(editingTeamId ? 'Team updated successfully!' : 'Team saved successfully!');
      
      // Navigate back to saved teams
      navigate(`/saved-teams/${match_id}/${team1_name}vs${team2_name}`);
    } catch (error) {
      console.error('Error saving team:', error);
      alert(error.response?.data?.message || 'Failed to save team');
    }
  };

  // Add team navigation controls
  const handleNextTeam = () => {
    if (teamData && teamData.teams && currentTeamIndex < teamData.teams.length - 1) {
      setCurrentTeamIndex(currentTeamIndex + 1);
    }
  };

  const handlePrevTeam = () => {
    if (currentTeamIndex > 0) {
      setCurrentTeamIndex(currentTeamIndex - 1);
    }
  };

  // Add new function to handle saving all teams
  const handleSaveAllTeams = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!teamData?.teams || teamData.teams.length === 0) {
      alert('No teams to save!');
      return;
    }

    try {
      // Save each team sequentially
      const savePromises = teamData.teams.map(async (teamObj) => {
        const dataToSave = {
          team: teamObj.team,
          strategies: teamData.strategies || {},
          match_id: match_id
        };

        const response = await axios.post(
          'https://cricket-analytics-node.onrender.com/api/ai-teams',
          dataToSave,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response;
      });

      await Promise.all(savePromises);
      
      // Show success message
      alert('All teams saved successfully!');
      
      // Navigate back to saved teams
      navigate(`/saved-teams/${match_id}/${team1_name}vs${team2_name}`);
    } catch (error) {
      console.error('Error saving teams:', error);
      alert(error.response?.data?.message || 'Failed to save teams');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 relative">
      <header className="p-4 bg-green-900 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-yellow-400 font-cricket">
          🏏 AI Fantasy Premier League
        </h1>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-b from-green-800 to-green-600 rounded-xl p-6 shadow-2xl relative">
          {/* Add team navigation if multiple teams exist */}
          {teamData?.teams?.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <button
                onClick={handlePrevTeam}
                disabled={currentTeamIndex === 0}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50"
              >
                Previous Team
              </button>
              <span className="text-white">
                Team {currentTeamIndex + 1} of {teamData.teams.length}
              </span>
              <button
                onClick={handleNextTeam}
                disabled={currentTeamIndex === teamData.teams.length - 1}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50"
              >
                Next Team
              </button>
            </div>
          )}

          {/* Show loading state */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          {/* Show error state */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-16" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Modified team actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <button 
              onClick={handleEditMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                isEditMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FaEdit />
              {isEditMode ? 'Exit Edit Mode' : 'Edit Team'}
            </button>
            <div className="flex gap-2">
              {teamData?.teams?.length > 1 && (
                <button 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  onClick={handleSaveAllTeams}
                >
                  <FaSave />
                  Save All Teams
                </button>
              )}
              <button 
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm"
                onClick={handleSaveTeam}
              >
                <FaSave />
                Save Current Team
              </button>
            </div>
          </div>
           {/* Floating buttons */}
        <div className="fixed bottom-24 right-4 space-y-4">
          
          <button
            onClick={() => navigate(`/saved-teams/${match_id}/${team1_name}vs${team2_name}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
            title="View Saved Teams"
          >
            <FaList size={24} />
          </button>
        </div>

          {/* Show team display or empty state */}
          {!loading && !error && (
            <>
              {teamData ? (
                <>
                  <TeamDisplay 
                    teamData={teamData} 
                    currentTeamIndex={currentTeamIndex}
                    onPlayerClick={setSelectedPlayer} 
                  />
                  <StrategySection strategies={teamData.strategies} />
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-white text-lg">Enter a query to generate or modify your fantasy team</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        onSearch={handleSearch}
        isEditMode={isEditMode}
      />

      {showSaved && (
        <button 
          className="fixed bottom-20 right-4 bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
          onClick={() => setShowSaved(!showSaved)}
        >
          📋 Saved Teams
        </button>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2">{selectedPlayer.name}</h3>
            <p className="text-gray-600">{selectedPlayer.reason}</p>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="mt-4 w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FantasyTeam;