import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionTimeoutModal from './SessionTimeoutModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const handleTimeout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate('/login', { replace: true });
  }, [navigate]);

  const { updateActivity } = useSessionTimeout({
    timeoutMinutes: 15,
    warningMinutes: 1,
    onTimeout: handleTimeout,
    onWarningStateChange: setShowTimeoutWarning,
    isActive: isAuthenticated
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        // Simple verification call to /admin/auth/me
        await axios.get('http://localhost:5000/admin/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth verification failed", err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkAuth();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SessionTimeoutModal 
        isOpen={showTimeoutWarning} 
        countdownMinutes={1} 
        onStayLoggedIn={updateActivity} 
      />
      {children}
    </>
  );
};

export default ProtectedRoute;
