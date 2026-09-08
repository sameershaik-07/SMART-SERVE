import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi } from '../api/auth';
import { getProfileApi } from '../api/users';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profileData = await getProfileApi();
        const userData = profileData.user || profileData;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.warn('Backend unavailable, using cached session:', err);
        // If it's a 401/403 unauthorized, logout. Otherwise retain cached user.
        if (err.status === 401 || err.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials) => {
    try {
      // 1. Always attempt the live backend API first
      const res = await loginApi(credentials);
      const jwtToken = res.token || res.accessToken;
      const userData = res.user;

      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      return res;
    } catch (error) {
      // Re-throw genuine authentication errors
      const errorMsg = error.data?.message || error.message || 'Authentication failed';
      throw new Error(errorMsg);
    }
  };

  const register = async (formData) => {
    try {
      return await registerApi(formData);
    } catch (error) {
      const errorMsg = error.data?.message || error.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
