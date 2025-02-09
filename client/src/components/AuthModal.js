import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import GoogleSignIn from './GoogleSignIn';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.();
      onClose();
    }
  }, [isAuthenticated, onClose, onSuccess]);

  if (!mounted || !isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col">
          {/* Gradient Top Border */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

          <div className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Sign in to Cricket Analytics
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Access personalized cricket insights and analysis
              </p>
            </div>

            <div className="space-y-4">
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Continue with
                  </span>
                </div>
              </div>

              {/* Auth Providers */}
              <div className="flex justify-center pt-2">
                <GoogleSignIn onSuccess={onSuccess} />
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="font-medium text-indigo-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-indigo-600 hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Gradient Bottom Border */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-indigo-600" />
        </div>
      </div>
    </div>
  );
}