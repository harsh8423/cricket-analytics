import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, AlertCircle } from 'lucide-react';
import GoogleSignIn from '../components/GoogleSignIn';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 animate-ping bg-red-100 rounded-full opacity-75" />
          <div className="relative">
            <ShieldX size={64} className="mx-auto text-red-500" />
          </div>
        </div>

        {/* Main Error Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unauthorized Access
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <AlertCircle className="text-amber-500" />
            <p className="text-gray-600">
              Please sign in to access this page
            </p>
          </div>

          <p className="text-gray-500 mb-8">
            You don't have permission to access this page. Please login or return to the homepage.
          </p>

          {/* Action Buttons Container */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200"
            >
              <Home size={20} />
              Go to Home
            </button>

            {/* Enhanced Google Sign In */}
            <div className="flex justify-center">
              <GoogleSignIn />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact support
        </p>
      </div>
    </div>
  );
}