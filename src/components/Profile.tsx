import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface UserData {
  fullName: string;
  team: string;
}

interface Training {
  id: string;
  type: string;
  details: string;
  createdAt: any;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        navigate('/');
      }
    };

    const fetchTrainings = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const trainingsQuery = query(
          collection(db, 'trainings'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const trainingsSnapshot = await getDocs(trainingsQuery);
        const fetchedTrainings = trainingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Training));
        setTrainings(fetchedTrainings);
      }
    };

    fetchUserData();
    fetchTrainings();
  }, [navigate]);

  return (
    <div className="user-profile p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">User Profile</h1>
      {userData && (
        <div className="mb-8 text-center">
          <p className="text-xl">Name: {userData.fullName}</p>
          <p className="text-xl">Team: {userData.team}</p>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Training History</h2>
        {trainings.length > 0 ? (
          <ul className="space-y-4">
            {trainings.map((training) => (
              <li key={training.id} className="bg-white p-4 rounded shadow">
                <p className="font-bold">{training.type} Training</p>
                <p>{training.details}</p>
                <p className="text-sm text-gray-500">
                  {training.createdAt && new Date(training.createdAt.seconds * 1000).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No trainings logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;