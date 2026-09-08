import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-8xl font-black text-purple-600 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')} variant="primary">
        Back to Home
      </Button>
    </div>
  );
};
