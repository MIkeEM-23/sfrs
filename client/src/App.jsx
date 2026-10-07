import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import Availability from './pages/Availability';
import Reservation from './pages/Reservation';
import MyReservations from './pages/MyReservations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/reserve" element={<Reservation />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
