'use client';

import { useState } from 'react';
import { authService } from '@/services/auth';

export default function TestLoginPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    const isAuth = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    setDebugInfo({
      token: token ? 'Present' : 'Missing',
      user: user ? 'Present' : 'Missing',
      isAuthenticated: isAuth,
      currentUser: currentUser,
      userParsed: user ? JSON.parse(user) : null
    });
  };

  const clearAuth = () => {
    authService.logout();
    checkAuth();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login Debug Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Check Auth Status
        </button>
        
        <button 
          onClick={clearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded ml-2"
        >
          Clear Auth
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Debug Info:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}
