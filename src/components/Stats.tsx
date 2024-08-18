import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface Training {
  id: string;
  userId: string;
  type: string;
  details: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface User {
  id: string;
  fullName: string;
  team: string;
}

const Stats: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const trainingsQuery = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
      const trainingsSnapshot = await getDocs(trainingsQuery);
      const fetchedTrainings = trainingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Training));
      setTrainings(fetchedTrainings);

      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const fetchedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(fetchedUsers);
    };

    fetchData();
  }, []);

  const userTrainingCounts = trainings.reduce((acc, training) => {
    acc[training.userId] = (acc[training.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trainingTypeCounts = trainings.reduce((acc, training) => {
    acc[training.type] = (acc[training.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teamTrainingCounts = users.reduce((acc, user) => {
    const userTrainingCount = userTrainingCounts[user.id] || 0;
    acc[user.team] = (acc[user.team] || 0) + userTrainingCount;
    return acc;
  }, {} as Record<string, number>);

  const userChartData = {
    labels: Object.keys(userTrainingCounts).map(userId => {
      const user = users.find(u => u.id === userId);
      return user ? user.fullName : 'משתמש לא ידוע';
    }),
    datasets: [
      {
        data: Object.values(userTrainingCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(trainingTypeCounts),
    datasets: [
      {
        data: Object.values(trainingTypeCounts),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      },
    ],
  };

  const teamChartData = {
    labels: Object.keys(teamTrainingCounts),
    datasets: [
      {
        label: 'מספר אימונים',
        data: Object.values(teamTrainingCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="stats p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">סטטיסטיקות אימונים</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">אימונים לפי משתמש</h2>
          <Doughnut data={userChartData} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">סוגי אימונים</h2>
          <Bar 
            data={typeChartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">אימונים לפי צוות</h2>
        <Bar 
          data={teamChartData}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">אימונים אחרונים</h2>
        <ul className="space-y-2">
          {trainings.slice(0, 10).map((training) => (
            <li key={training.id} className="bg-white p-2 rounded shadow">
              <p><strong>{training.type}</strong> - {new Date(training.createdAt.seconds * 1000).toLocaleString('he-IL')}</p>
              <p>{training.details}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stats;