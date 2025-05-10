import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred during login.');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        }
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists.');
        }
        if (error.code === 'auth/invalid-email') {
          throw new Error('Invalid email address.');
        }
        if (error.code === 'auth/weak-password') {
          throw new Error('Password is too weak. Please use a stronger password.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred during logout.');
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 