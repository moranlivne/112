import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, UserCircle, Home, Settings } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav bg-white shadow-lg p-4 flex justify-around items-center fixed bottom-0 left-0 right-0 h-20">
      <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-purple-600' : 'text-gray-600'}`}>
        <Home size={28} />
        <span className="text-sm mt-1">בית</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-purple-600' : 'text-gray-600'}`}>
        <UserCircle size={28} />
        <span className="text-sm mt-1">פרופיל</span>
      </Link>
      <Link to="/stats" className={`flex flex-col items-center ${location.pathname === '/stats' ? 'text-purple-600' : 'text-gray-600'}`}>
        <BarChart size={28} />
        <span className="text-sm mt-1">סטטיסטיקות</span>
      </Link>
      <Link to="/admin" className={`flex flex-col items-center ${location.pathname === '/admin' ? 'text-purple-600' : 'text-gray-600'}`}>
        <Settings size={28} />
        <span className="text-sm mt-1">אדמין</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;