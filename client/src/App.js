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
import SavedTeams from './pages/SavedTeams';
import DiscussionDetail from './pages/DiscussionDetail';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { AdminRoute } from './components/ProtectedRoute';
import MatchEditor from './admin/MatchEditor';

function App() {
    return (
        <AuthProvider>
            <TimeProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route
                            path="/admin/*"
                            element={
                                <AdminRoute>
                                    <Admin />
                                </AdminRoute>
                            }
                        />
                        <Route path="/admin/add-match" element={
                            <AdminRoute>
                                <AddMatch />
                            </AdminRoute>
                        } />
                        <Route path="/admin/add-prediction" element={
                            <AdminRoute>
                                <AddPrediction />
                            </AdminRoute>
                        } />
                        <Route path="/admin/match-editor" element={
                            <AdminRoute>
                                <MatchEditor />
                            </AdminRoute>
                        } />
                        <Route path="/menubar/:match_id/:teamname" element={<MenuBar />} />
                        <Route path="/Dashboard/:match_id/:teamname/:activePage" element={<MatchAnalytics />} />
                        <Route path="/saved-teams/:match_id/:teamname" element={<SavedTeams />} />
                        <Route path="/discussions/:id" element={<DiscussionDetail />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    </Routes>
                </Router>
            </TimeProvider>
        </AuthProvider>
    );
}

export default App;
