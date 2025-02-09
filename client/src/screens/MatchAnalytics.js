import React, { useState, useEffect } from 'react';
import { useLocation} from 'react-router-dom';
import { useParams } from "react-router-dom";


import Sidebar from "./Sidebar";
import AIFantasyTeam from "../dashboards/AIFantasyTeam";
import Compare from "../dashboards/Compare";
import TeamDetails from "../dashboards/TeamDetails";
import ChatAssistant from "./ChatAssistant";
import CommunityDiscussion from "../dashboards/CommunityDiscussion";
import ExpertPredictions from "../dashboards/ExpertPredictions";
import TeamH2H from '../dashboards/TeamH2H';
import InDepthAnalysis from '../dashboards/InDepthAnalysis';
import PlayerRatings from '../dashboards/PlayerRatings';
import KeyInsights from '../dashboards/KeyInsights';
import CheatSheet from '../dashboards/CheatSheet';
import VenueStats from '../dashboards/VenueStats';


// Updated MatchAnalytics.js
const MatchAnalytics = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(
    location.state?.activePage || "overview"
  );

  const { teamname } = useParams();

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex-1 overflow-auto p-4">
        {activePage === "team1" && <TeamDetails teamname={team1_name} />}
        {activePage === "team2" && <TeamDetails teamname={team2_name} />}
        {activePage === "compare" && <Compare />}
        {activePage === "fantasy" && <AIFantasyTeam />}
        {activePage === "discussion" && <CommunityDiscussion />}
        {activePage === "expertPrediction" && <ExpertPredictions />}
        {activePage === "chat" && <ChatAssistant />}
        {activePage === "KeyInsights" && <KeyInsights />}
        {activePage === "PlayerRatings" && <PlayerRatings />}
        {activePage === "CheatSheet" && <CheatSheet />}
        {activePage === "VenueStats" && <VenueStats />}
        {activePage === "TeamH2H" && <TeamH2H />}
        {activePage === "InDepthAnalysis" && <InDepthAnalysis />}
        <ChatAssistant/>
      </div>
    </div>
  );
};

export default MatchAnalytics;
