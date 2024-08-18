import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const TrainingForm: React.FC = () => {
  const [trainingType, setTrainingType] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `trainings/${userId}/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const docRef = await addDoc(collection(db, 'trainings'), {
        userId,
        type: trainingType,
        details,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      console.log('אימון נשמר בהצלחה עם מזהה:', docRef.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('שגיאה בהוספת אימון:', error);
      alert('אירעה שגיאה בשמירת האימון. אנא נסה שוב.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="training-form p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-600">הוספת אימון חדש</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">סוג האימון:</label>
          <div className="flex justify-around">
            <label className="flex items-center">
              <input
                type="radio"
                name="trainingType"
                value="כוח"
                checked={trainingType === 'כוח'}
                onChange={() => setTrainingType('כוח')}
                className="mr-2"
                required
              />
              כוח
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="trainingType"
                value="ריצה"
                checked={trainingType === 'ריצה'}
                onChange={() => setTrainingType('ריצה')}
                className="mr-2"
                required
              />
              ריצה
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="details" className="block mb-2 font-semibold text-gray-700">פרטי האימון:</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-2 font-semibold text-gray-700">העלאת תמונה או צילום מסך מהאימון:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700 transition duration-300"
          disabled={uploading}
        >
          {uploading ? 'מעלה אימון...' : 'הוסף אימון'}
        </button>
      </form>
    </div>
  );
};

export default TrainingForm;