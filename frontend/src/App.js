import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminAnalytics from './pages/AdminAnalytics';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  return role === 'admin' ? children : <Navigate to="/" />;
};

// Only customers (logged-in, non-admin users) can access Profile
const CustomerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  if (role === 'admin') return <Navigate to="/admin" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<CustomerRoute><Profile /></CustomerRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> 
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
