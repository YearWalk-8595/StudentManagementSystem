import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ForgotPassword from './components/ForgotPassword';
import StudentDashboard from './components/StudentDashboard';
import './components/StudentDashboard.css';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="container">加载中...</div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Home user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/login"
            element={
              !user ? <Login /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/register"
            element={
              !user ? <Register /> : <Navigate to="/" replace />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/student-system" 
            element={
              user ? <StudentDashboard /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;