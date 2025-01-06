import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Index from "../../pages/Index";
import Tournaments from "../../pages/Tournaments";
import TournamentDetails from "../../pages/TournamentDetails";
import Matchmaking from "../../pages/Matchmaking";
import MatchDetails from "../../pages/MatchDetails";
import Profile from "../../pages/Profile";
import Auth from "../../pages/Auth";
import TournamentManagement from "../../pages/admin/TournamentManagement";
import UserManagement from "../../pages/admin/UserManagement";
import DisputeManagement from "../../pages/admin/DisputeManagement";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
      <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
      <Route path="/tournaments/:id" element={<PrivateRoute><TournamentDetails /></PrivateRoute>} />
      <Route path="/matchmaking" element={<PrivateRoute><Matchmaking /></PrivateRoute>} />
      <Route path="/matches/:id" element={<PrivateRoute><MatchDetails /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/tournaments" 
        element={
          <PrivateRoute adminOnly>
            <TournamentManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <PrivateRoute adminOnly>
            <UserManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/disputes" 
        element={
          <PrivateRoute adminOnly>
            <DisputeManagement />
          </PrivateRoute>
        } 
      />
      
      <Route path="/login" element={<Auth />} />
    </Routes>
  );
};

export default AppRoutes;
