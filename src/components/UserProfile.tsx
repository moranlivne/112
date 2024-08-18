import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  fullName: string;
  team: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          console.error('לא נמצאו נתוני משתמש.');
        }
      } catch (error) {
        console.error('שגיאה בטעינת נתוני משתמש:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="user-profile p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">פרופיל משתמש</h1>
      {userData ? (
        <div className="mb-8 text-center">
          <p className="text-xl">שם: {userData.fullName}</p>
          <p className="text-xl">צוות: {userData.team}</p>
        </div>
      ) : (
        <p>טוען נתוני משתמש...</p>
      )}
      <button 
        onClick={handleLogout}
        className="mb-8 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
      >
        התנתק
      </button>
    </div>
  );
};

export default UserProfile;