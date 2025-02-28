import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, token, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isAuthenticated || !token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('https://cricket-analytics-node.onrender.com/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          console.log('admin verified');
          setIsAdminVerified(true);
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        setIsAdminVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminAccess();
  }, [token]);

  // Show loading state while checking authentication and admin status
  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" />;
  }

  // Redirect to unauthorized page if not admin or verification failed
  if (!isAdminVerified) {
    return <Navigate to="/unauthorized" />;
  }

  // Render admin component if all checks pass
  return children;
}; 