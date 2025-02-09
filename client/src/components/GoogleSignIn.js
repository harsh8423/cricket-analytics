import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignIn = ({ onSuccess }) => {
  const { login } = useAuth();

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: '904389234161-6a296iocvp1702cflt0coo00deb7qdpe.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin'),
          { 
            theme: 'filled_blue',
            size: 'large',
            width: '250',
            text: 'continue_with',
            shape: 'rectangular',
          }
        );
      };

      document.body.appendChild(script);
      return script;
    };

    const script = loadGoogleScript();
    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await result.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        await login(data.token);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    <div className="flex justify-center">
      <div id="google-signin" className="w-full"></div>
    </div>
  );
};

export default GoogleSignIn; 