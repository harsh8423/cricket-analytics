import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeProvider } from './contexts/TimeContext';
// import PlayersAnalysis from './dashboards/PlayersAnalysis';
import MatchAnalytics from './screens/MatchAnalytics';
import HomePage from './screens/Homepage';
import MenuBar from './screens/MenuBar';
import Admin from './admin/Admin';
import AddMatch from './admin/AddMatch';
import AddPrediction from './admin/AddPrediction';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <TimeProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/add-match" element={<AddMatch />} />
                        <Route path="/admin/add-prediction" element={<AddPrediction />} />
                        <Route path="/menubar/:teamname/:matchId" element={<MenuBar />} />
                        <Route path="/Dashboard/:teamname/:activePage" element={<MatchAnalytics />} />
                    </Routes>
                </Router>
            </TimeProvider>
        </AuthProvider>
    );
}

export default App;
