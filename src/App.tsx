import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import Dashboard from "./components/Dashboard";
import TrainingForm from "./components/TrainingForm";
import UserProfile from "./components/UserProfile";
import Stats from "./components/Stats";
import BottomNavigation from "./components/BottomNavigation";
import AdminDashboard from "./components/AdminDashboard";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);

  return (
    <Router>
      <div dir="rtl" className="app flex flex-col min-h-screen bg-purple-100">
        <main className="flex-grow pb-24">
          <Routes>
            <Route path="/" element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <WelcomeScreen />
            } />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/training" element={<TrainingForm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </Router>
  );
};

export default App;