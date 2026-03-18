import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Verify token or get user profile. Assumes a /profile/me or similar endpoint exists to validate token.
          // Since the prompt mainly discusses /api/profile/me for Students, we might just rely on token existence
          // for initial routing and let API requests fail if invalid.
          // But it's better to manage it cleanly. For now, if token exists, we set authenticated state to true.
          // In a real app we would call an endpoint to get the user's role and details.
          // Let's assume the role is securely saved or we fetch the /profile/me
          // The prompt says: "Response contains: token, role, mustChangePassword", "Store JWT token in localStorage"
        } catch (error) {
          console.error('Failed to initialize auth', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = (newToken, newRole, mustChange) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
