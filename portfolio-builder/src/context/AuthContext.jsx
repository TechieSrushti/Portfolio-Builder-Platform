import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.auth.getProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return { success: true, devVerificationUrl: res.devVerificationUrl };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.auth.updateProfile(data);
      if (res.success) {
        setUser(res.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePlanLocally = (newPlan) => {
    if (user) {
      setUser(prev => ({ ...prev, plan: newPlan }));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        updatePlanLocally,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
