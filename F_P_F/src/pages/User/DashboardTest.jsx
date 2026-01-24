import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Simple test component to debug the dashboard
export default function DashboardTest() {
  const { user, isAuthenticated } = useAuth();

  console.log('Dashboard Test - User:', user);
  console.log('Dashboard Test - Authenticated:', isAuthenticated);
  console.log('Dashboard Test - User Role:', user?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1>Dashboard Debug Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2>Debug Information:</h2>
        <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
        <p>User Role: {user?.role || 'No role'}</p>
      </div>

      {isAuthenticated && user?.role === 'seller' ? (
        <div className="bg-green-100 p-6 rounded-lg shadow mt-4">
          <h2>✅ Seller Dashboard Should Work</h2>
          <p>You have the correct role and authentication.</p>
        </div>
      ) : (
        <div className="bg-red-100 p-6 rounded-lg shadow mt-4">
          <h2>❌ Dashboard Access Issues</h2>
          <p>Issues found:</p>
          <ul>
            {!isAuthenticated && <li>• Not authenticated</li>}
            {!user && <li>• No user data</li>}
            {user?.role !== 'seller' && <li>• User role is not 'seller': {user?.role}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
