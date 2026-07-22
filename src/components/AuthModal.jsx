import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Store profile details in Firestore
        const userDocData = {
          fullName: fullName,
          email: email,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", user.uid), userDocData);
        console.log("🔥 FIRESTORE SUCCESS: Saved user document", userDocData);

      } else {
        // 3. Sign In with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("🔥 FIREBASE AUTH SUCCESS: Signed in as", userCredential.user.email);
      }

      setLoading(false);
      onClose(); // Close modal

      // 4. 🚀 Redirect straight to Home/Dashboard
      navigate('/home'); 

    } catch (err) {
      console.error("Auth Error:", err);
      setLoading(false);
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-epilogue">
      <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          {isSignUp ? "Sign up to start managing campaigns" : "Sign in to access your dashboard"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setError('');
              setIsSignUp(!isSignUp);
            }}
            className="text-[#8c6dfd] font-semibold underline hover:text-[#7a59e6]"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;