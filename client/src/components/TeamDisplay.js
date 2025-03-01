import React from 'react'
import { FaUserCircle, FaSave, FaEdit, FaList, FaSearch, FaEye } from 'react-icons/fa';

const PlayerCard = ({ player, onClick }) => {
    if (!player) return null;
    
    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="relative bg-white/90 rounded-lg p-2 w-20 sm:w-24 text-center">
          <div className="text-xs font-medium text-gray-800 truncate max-w-full">{player.name}</div>
          {player.is_captain && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">C</span>
          )}
          {player.is_vice_captain && (
            <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">VC</span>
          )}
          <div className="text-[10px] text-gray-600 truncate max-w-full">{player.role}</div>
          <button
            onClick={() => onClick(player)}
            className="mt-1 w-full bg-green-700 text-white text-[10px] py-0.5 rounded flex items-center justify-center gap-1 hover:bg-green-800"
          >
            <FaEye size={10} />
            View
          </button>
        </div>
      </div>
    );
  };
  
const TeamDisplay = ({ teamData, currentTeamIndex, onPlayerClick }) => {
    if (!teamData?.teams?.[currentTeamIndex]?.team) return null;
  
    const currentTeam = teamData.teams[currentTeamIndex].team;
  
    const filterPlayersByRole = (role) => {
      return currentTeam.filter(player => player.role === role);
    };
  
    const filterAllRounders = () => {
      return currentTeam.filter(player => 
        player.role.includes("Allrounder")
      );
    };
  
    return (
      <div className="mt-16 space-y-6 sm:space-y-8">
        {/* Wicket Keeper */}
        <div className="text-center">
          <h3 className="text-white text-sm font-semibold mb-2">WICKET KEEPER</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {filterPlayersByRole("WK-Batsman").map((player, index) => (
              <PlayerCard key={index} player={player} onClick={onPlayerClick} />
            ))}
          </div>
        </div>
  
        {/* Batsmen */}
        <div className="text-center">
          <h3 className="text-white text-sm font-semibold mb-2">BATSMEN</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {filterPlayersByRole("Batsman").map((player, index) => (
              <PlayerCard key={index} player={player} onClick={onPlayerClick} />
            ))}
          </div>
        </div>
  
        {/* All Rounders */}
        <div className="text-center">
          <h3 className="text-white text-sm font-semibold mb-2">ALL ROUNDERS</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {filterAllRounders().map((player, index) => (
              <PlayerCard key={index} player={player} onClick={onPlayerClick} />
            ))}
          </div>
        </div>
  
        {/* Bowlers */}
        <div className="text-center">
          <h3 className="text-white text-sm font-semibold mb-2">BOWLERS</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {filterPlayersByRole("Bowler").map((player, index) => (
              <PlayerCard key={index} player={player} onClick={onPlayerClick} />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default TeamDisplay;