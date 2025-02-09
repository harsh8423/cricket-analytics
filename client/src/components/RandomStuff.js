// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Cell } from 'recharts';

// const data = [
//   { ageGroup: '0-9', value: 95000 },
//   { ageGroup: '10-19', value: 165000 },
//   { ageGroup: '20-29', value: 120000 },
//   { ageGroup: '30-39', value: 130000 },
//   { ageGroup: '40-49', value: 95000 },
//   { ageGroup: '50-59', value: 45000 },
//   { ageGroup: '60-69', value: 25000 },
//   { ageGroup: '70-79', value: 15000 },
//   { ageGroup: '80-89', value: 8000 },
//   { ageGroup: '90+', value: 3000 }
// ];

// const colors = [
//   '#4287f5', // blue
//   '#5c3af5', // purple
//   '#3df588', // green
//   '#f5703a', // orange
//   '#8193b5', // grey blue
//   '#d43af5', // pink
//   '#3af5e4', // cyan
//   '#f53a3a', // red
//   '#f5b53a', // light orange
//   '#3af5b5'  // light cyan
// ];

// const Overview = () => {
//   const CustomBar = (props) => {
//     const { x, y, width, height, fill } = props;

//     return (
//       <g>
//         {/* Main bar */}
//         <rect x={x} y={y} width={width} height={height} fill={fill} />
        
//         {/* Top 3D effect */}
//         <path
//           d={`
//             M ${x},${y}
//             L ${x + width},${y}
//             L ${x + width - 10},${y - 10}
//             L ${x - 10},${y - 10}
//             Z
//           `}
//           fill={fill}
//           opacity={0.8}
//         />
        
//         {/* Side 3D effect */}
//         <path
//           d={`
//             M ${x + width},${y}
//             L ${x + width - 10},${y - 10}
//             L ${x + width - 10},${y + height - 10}
//             L ${x + width},${y + height}
//             Z
//           `}
//           fill={fill}
//           opacity={0.6}
//         />
//       </g>
//     );
//   };

//   return (
//     <div className="w-full h-[600px] bg-white p-6 rounded-lg shadow-sm">
//       <h2 className="text-xl font-semibold mb-4">Age Distribution</h2>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={data}
//           margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" vertical={false} />
//           <XAxis 
//             dataKey="ageGroup" 
//             label={{ 
//               value: 'Age groups', 
//               position: 'bottom', 
//               offset: 0 
//             }}
//           />
//           <YAxis
//             label={{ 
//               value: 'Reported cases', 
//               angle: -90, 
//               position: 'insideLeft',
//               offset: 10
//             }}
//           />
//           <Tooltip 
//             formatter={(value) => [`${value.toLocaleString()}`, 'Cases']}
//             labelFormatter={(label) => `Age: ${label}`}
//           />
//           <Bar 
//             dataKey="value" 
//             shape={<CustomBar />}
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={colors[index]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Overview;




//////////////////////////////////////////////////////////TOP BAR/////////////////


import React, { useState, useEffect } from 'react';
import { 
  HomeIcon,
  Users,
  Swords,
  Brain,
} from 'lucide-react';
import Sidebar from "./Sidebar";
import AIFantasyTeam from "../dashboards/AIFantasyTeam";
import Overview from "../dashboards/Overview";
import TeamView from "../dashboards/TeamView";
import Compare from "../dashboards/Compare";
import TeamDetails from "../dashboards/TeamDetails";
import ChatAssistant from "./ChatAssistant";
import CommunityDiscussion from "./CommunityDiscussion";
import ExpertPredictions from "./ExpertPredictions";

import { useSwipeable } from 'react-swipeable';

const TopTabBar = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex h-12">
        <button
          onClick={() => onTabChange('match')}
          className={`flex-1 flex items-center justify-center border-b-2 
            ${activeTab === 'match' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500'}`}
        >
          <span className="font-medium">Match Analytics</span>
        </button>
        <button
          onClick={() => onTabChange('discussion')}
          className={`flex-1 flex items-center justify-center border-b-2 
            ${activeTab === 'discussion' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500'}`}
        >
          <span className="font-medium">Discussion</span>
        </button>
      </div>
    </div>
  );
};




const BottomNav = ({ activePage, setActivePage }) => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe rounded-t-xl shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavButton 
            icon={<HomeIcon />} 
            label="Overview" 
            isActive={activePage === 'overview'}
            onClick={() => setActivePage('overview')}
          />
          <NavButton 
            icon={<Users />} 
            label="Team 1" 
            isActive={activePage === 'team1'}
            onClick={() => setActivePage('team1')}
          />
          <div className="relative -mt-8">
            <button 
              onClick={() => setActivePage('fantasy')}
              className={`w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 
                flex items-center justify-center shadow-xl transform transition-all duration-200
                border-8 border-gray-100 hover:scale-105
                ${activePage === 'fantasy' ? 'from-indigo-600 to-indigo-800 shadow-inner' : ''}
                relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black opacity-10 rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="font-semibold text-white text-sm">AI</span>
                <span className="text-white text-xs opacity-90">Fantasy</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
            </button>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"></div>
          </div>
          <NavButton 
            icon={<Users />} 
            label="Team 2" 
            isActive={activePage === 'team2'}
            onClick={() => setActivePage('team2')}
          />
          <NavButton 
            icon={<Swords />} 
            label="Compare" 
            isActive={activePage === 'compare'}
            onClick={() => setActivePage('compare')}
          />
        </div>
      </div>
    );
  };
  
  const NavButton = ({ icon, label, isActive, onClick }) => {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center w-16 transition-colors duration-200"
      >
        <div className={`${isActive ? 'text-indigo-600' : 'text-gray-500'} transform transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <span className={`text-xs mt-1 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
          {label}
        </span>
      </button>
    );
  };
  
  const MatchAnalytics = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activePage, setActivePage] = useState("overview");
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState('match');
  
    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => {
        window.removeEventListener('resize', checkScreenSize);
      };
    }, []);
  
    const handlers = useSwipeable({
      onSwipedRight: () => {
        if (isMobile && activeTab === 'match') {
          setActiveTab('discussion');
        }
      },
      onSwipedLeft: () => {
        if (isMobile && activeTab === 'discussion') {
          setActiveTab('match');
        }
      },
      trackMouse: true
    });
  
    const handleTabChange = (tab) => {
      setActiveTab(tab);
      if (tab === 'match') {
        setActivePage('overview');
      } else {
        setActivePage('discussion');
      }
    };
  
    return (
      <div className="flex h-screen bg-gray-100">
        {!isMobile && (
          <Sidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            activePage={activePage}
            setActivePage={setActivePage}
          />
        )}
        {isMobile && <TopTabBar activeTab={activeTab} onTabChange={handleTabChange} />}
        <div 
          {...handlers}
          className={`flex-1 overflow-auto ${isMobile ? 'pt-12 pb-20' : 'p-4'}`}
        >
          {activeTab === 'match' ? (
            <>
              {activePage === "overview" && <Overview />}
              {activePage === "team1" && <TeamDetails players={players}/>}
              {activePage === "team2" && <TeamDetails players={players}/>}
              {activePage === "compare" && <Compare />}
              {activePage === "fantasy" && <AIFantasyTeam />}
            </>
          ) : (
            <CommunityDiscussion />
          )}
        </div>
        {isMobile && activeTab === 'match' && (
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        )}
        <ChatAssistant/>
      </div>
    );
  };
  export default MatchAnalytics;