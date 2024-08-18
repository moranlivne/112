import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface User {
  id: string;
  fullName: string;
  team: string;
}

interface Training {
  id: string;
  userId: string;
  type: string;
  details: string;
  imageUrl?: string;
  createdAt: any;
}

const AdminDashboard: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchTrainings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345') {
      setIsAuthenticated(true);
    } else {
      alert('סיסמה שגויה');
    }
  };

  const fetchUsers = async () => {
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    setUsers(usersList);
  };

  const fetchTrainings = async () => {
    const trainingsQuery = query(collection(db, 'trainings'));
    const trainingsSnapshot = await getDocs(trainingsQuery);
    const trainingsList = trainingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training));
    setTrainings(trainingsList);
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      // מחיקת כל האימונים של המשתמש
      const userTrainings = trainings.filter(training => training.userId === userId);
      for (const training of userTrainings) {
        await deleteDoc(doc(db, 'trainings', training.id));
        if (training.imageUrl) {
          await deleteObject(ref(storage, training.imageUrl));
        }
      }
      setTrainings(trainings.filter(training => training.userId !== userId));
    }
  };

  const deleteTraining = async (trainingId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אימון זה?')) {
      const training = trainings.find(t => t.id === trainingId);
      if (training && training.imageUrl) {
        await deleteObject(ref(storage, training.imageUrl));
      }
      await deleteDoc(doc(db, 'trainings', trainingId));
      setTrainings(trainings.filter(training => training.id !== trainingId));
    }
  };

  const startEditingUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const saveEditedUser = async () => {
    if (editingUser) {
      await updateDoc(doc(db, 'users', editingUser.id), {
        fullName: editingUser.fullName,
        team: editingUser.team
      });
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    }
  };

  const startEditingTraining = (training: Training) => {
    setEditingTraining({ ...training });
    setNewImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const saveEditedTraining = async () => {
    if (editingTraining) {
      let imageUrl = editingTraining.imageUrl;
      if (newImage) {
        const imageRef = ref(storage, `trainings/${editingTraining.userId}/${Date.now()}_${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);

        if (editingTraining.imageUrl) {
          await deleteObject(ref(storage, editingTraining.imageUrl));
        }
      }

      await updateDoc(doc(db, 'trainings', editingTraining.id), {
        type: editingTraining.type,
        details: editingTraining.details,
        imageUrl
      });

      setTrainings(trainings.map(t => t.id === editingTraining.id ? {...editingTraining, imageUrl} : t));
      setEditingTraining(null);
      setNewImage(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">כניסת מנהל</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">התחבר</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">לוח בקרה למנהל</h1>

      <h2 className="text-xl font-semibold mt-8 mb-4">משתמשים</h2>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="bg-white p-4 rounded shadow">
            {editingUser && editingUser.id === user.id ? (
              <>
                <input
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                  className="mb-2 p-2 border rounded w-full"
                  placeholder="שם מלא"
                />
                <input
                  value={editingUser.team}
                  onChange={(e) => setEditingUser({...editingUser, team: e.target.value})}
                  className="mb-2 p-2 border rounded w-full"
                  placeholder="צוות"
                />
                <button onClick={saveEditedUser} className="bg-green-500 text-white px-4 py-2 rounded mr-2">שמור</button>
                <button onClick={() => setEditingUser(null)} className="bg-gray-500 text-white px-4 py-2 rounded">בטל</button>
              </>
            ) : (
              <>
                <p><strong>שם: </strong>{user.fullName}</p>
                <p><strong>צוות: </strong>{user.team}</p>
                <div className="mt-2">
                  <button onClick={() => startEditingUser(user)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">ערוך</button>
                  <button onClick={() => deleteUser(user.id)} className="bg-red-500 text-white px-4 py-2 rounded">מחק</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">אימונים</h2>
      <ul className="space-y-4">
        {trainings.map(training => (
          <li key={training.id} className="bg-white p-4 rounded shadow">
            {editingTraining && editingTraining.id === training.id ? (
              <>
                <select 
                  value={editingTraining.type}
                  onChange={(e) => setEditingTraining({...editingTraining, type: e.target.value})}
                  className="mb-2 p-2 border rounded w-full"
                >
                  <option value="כוח">כוח</option>
                  <option value="ריצה">ריצה</option>
                </select>
                <textarea
                  value={editingTraining.details}
                  onChange={(e) => setEditingTraining({...editingTraining, details: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  rows={4}
                />
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                <button onClick={saveEditedTraining} className="bg-green-500 text-white px-4 py-2 rounded mr-2">שמור</button>
                <button onClick={() => setEditingTraining(null)} className="bg-gray-500 text-white px-4 py-2 rounded">בטל</button>
              </>
            ) : (
              <>
                <p><strong>סוג: </strong>{training.type}</p>
                <p><strong>פרטים: </strong>{training.details}</p>
                <p><strong>משתמש: </strong>{users.find(u => u.id === training.userId)?.fullName || 'לא ידוע'}</p>
                <p><strong>תאריך: </strong>{new Date(training.createdAt.seconds * 1000).toLocaleString('he-IL')}</p>
                {training.imageUrl && (
                  <img src={training.imageUrl} alt="תמונת אימון" className="mt-2 max-w-xs max-h-40 object-cover rounded" />
                )}
                <div className="mt-2">
                  <button onClick={() => startEditingTraining(training)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">ערוך</button>
                  <button onClick={() => deleteTraining(training.id)} className="bg-red-500 text-white px-4 py-2 rounded">מחק</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;