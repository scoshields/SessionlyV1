import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { useStore } from './store';
import { supabase } from './lib/supabase';

function App() {
  const { user, isInitialized, initialize } = useStore();

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await useStore.getState().setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        await useStore.getState().setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <Auth mode="signin" /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!user ? <Auth mode="signup" /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;