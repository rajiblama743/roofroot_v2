'use client';

import { useEffect, useState } from 'react';
import { authUtils } from '@/lib/authUtils';

function AgencyTestPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = authUtils.isAuthenticated();
        const user = authUtils.getUser();
        
        setUserInfo(user);
        
        if (!isAuth) {
          setAuthStatus('❌ Not authenticated');
        } else if (!user) {
          setAuthStatus('❌ No user data');
        } else if (user.role !== 'agency') {
          setAuthStatus(`❌ Wrong role: ${user.role} (need 'agency')`);
        } else {
          setAuthStatus('✅ Authenticated as agency');
        }
      } catch (error) {
        setAuthStatus(`❌ Error: ${error}`);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Agency Section Test</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <p className="text-lg font-mono">{authStatus}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
          {userInfo ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No user data found</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What This Means</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Not authenticated</strong>: You need to log in first</li>
            <li>• <strong>No user data</strong>: Login didn't save user info properly</li>
            <li>• <strong>Wrong role</strong>: Your user needs role: 'agency'</li>
            <li>• <strong>Authenticated as agency</strong>: You should be able to access /agency</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/agency" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Going to /agency
          </a>
        </div>
      </div>
    </div>
  );
}

export default AgencyTestPage;

