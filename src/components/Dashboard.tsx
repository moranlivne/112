import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

interface UserData {
  fullName: string;
  team: string;
}

interface Training {
  id: string;
  type: string;
  details: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        // Fetch user data
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          throw new Error('לא נמצאו נתוני משתמש.');
        }

        // Fetch trainings
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
      } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה לרענן את הדף.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDeleteTraining = async (trainingId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אימון זה?')) {
      try {
        await deleteDoc(doc(db, 'trainings', trainingId));
        setTrainings(trainings.filter(training => training.id !== trainingId));
      } catch (error) {
        console.error('שגיאה במחיקת האימון:', error);
        setError('אירעה שגיאה במחיקת האימון. אנא נסה שוב.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">טוען...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="dashboard p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center text-blue-600">לוח בקרה</h1>
      {userData && (
        <div className="mb-4 text-center">
          <p>שלום, {userData.fullName}!</p>
          <p>צוות: {userData.team}</p>
        </div>
      )}
      <div className="space-y-4">
        <Link to="/training" className="block w-full bg-blue-500 text-white p-4 rounded text-center shadow-md hover:bg-blue-600">
          הוסף אימון חדש
        </Link>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-500">האימונים שלך</h2>
        {trainings.length > 0 ? (
          <ul className="space-y-4">
            {trainings.map((training) => (
              <li key={training.id} className="bg-white p-4 rounded shadow-md relative">
                <p className="font-bold">{training.type} אימון</p>
                <p>{training.details}</p>
                <p className="text-sm text-gray-500">
                  {new Date(training.createdAt.seconds * 1000).toLocaleString('he-IL')}
                </p>
                <button 
                  onClick={() => handleDeleteTraining(training.id)}
                  className="absolute top-2 left-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>עדיין לא נרשמו אימונים.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;