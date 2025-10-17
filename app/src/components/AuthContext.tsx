'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean; // Added isAdmin property
}

interface AuthContextType {
  user: User | null;
  login: () => void; // No longer takes a token
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user data from the backend
  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me'); // A new API route to get current user info
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch user on component mount
  }, []);

  const login = () => {
    // After successful login (handled by signin page), re-fetch user data
    fetchUser();
  };

  const logout = async () => {
    // Invalidate the cookie on the server side
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
