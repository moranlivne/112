import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const WelcomeScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [team, setTeam] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userRef = await addDoc(collection(db, "users"), {
        fullName,
        team
      });
      localStorage.setItem('userId', userRef.id);
      navigate("/dashboard");
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      setError('אירעה שגיאה בהרשמה. אנא נסה שוב.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("fullName", "==", loginName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        localStorage.setItem('userId', userDoc.id);
        navigate("/dashboard");
      } else {
        setError("לא נמצא משתמש עם שם זה. נא לנסות שוב או להירשם.");
      }
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  return (
    <div className="welcome-screen min-h-screen flex flex-col justify-center items-center p-4 bg-purple-100">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-center text-purple-600">ברוכים הבאים למעקב אימונים</h1>
        <h2 className="text-xl font-semibold mb-6 text-center text-purple-500">פלגת התיעוד והצילום</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-6 flex justify-center space-x-4">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`px-4 py-2 rounded-full ${isLogin ? 'bg-purple-500 text-white' : 'bg-gray-200 text-purple-700'} transition duration-300`}
          >
            התחברות
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`px-4 py-2 rounded-full ${!isLogin ? 'bg-purple-500 text-white' : 'bg-gray-200 text-purple-700'} transition duration-300`}
          >
            הרשמה
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="loginName" className="block mb-1 text-purple-600">שם מלא:</label>
              <input
                type="text"
                id="loginName"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded-lg shadow-md hover:bg-purple-600 transition duration-300">
              התחברות
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block mb-1 text-purple-600">שם מלא:</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-purple-600">צוות:</label>
              <div className="flex flex-wrap justify-between">
                {['צפון', 'דרום', 'מרכז', 'מפל"ג', 'מטכ"לי'].map((teamName) => (
                  <label key={teamName} className="inline-flex items-center mt-2">
                    <input
                      type="radio"
                      name="team"
                      value={teamName}
                      checked={team === teamName}
                      onChange={() => setTeam(teamName)}
                      className="form-radio text-purple-500"
                      required
                    />
                    <span className="ml-2">{teamName}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded-lg shadow-md hover:bg-purple-600 transition duration-300">
              הרשמה
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;