import React from 'react';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">My Profile</h1>
      <p className="text-slate-500">Welcome, {user?.name || user?.email}!</p>
    </div>
  );
};

export default Profile;
