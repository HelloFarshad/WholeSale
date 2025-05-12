import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import supabase from '../lib/supabase';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkUser: async () => {},
  resetPassword: async () => {},
  updateUser: async () => {},
});

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkUser = useCallback(async () => {
    console.log('Checking user session...');
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setUser(null);
        return;
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      setUser(userData as User);
    } catch (err) {
      console.error('Error checking user:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setUser(null);
    } finally {
      console.log('User session check complete');
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (authError) {
        throw authError;
      }
      
      await checkUser(); // Check and set the user after login
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('User registration failed');
      }
      
      // Create profile in users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: credentials.name,
        email: credentials.email,
        role: credentials.role || 'clerk',
        assigned_warehouse_id: credentials.assigned_warehouse_id || null,
      });
      
      if (profileError) {
        throw profileError;
      }
      
      await checkUser();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUser({ ...user, ...userData });
    } catch (err) {
      console.error('Update user error:', err);
      setError(err instanceof Error ? err.message : 'User update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth changes
  React.useEffect(() => {
    const handleEvent = (event: string, session: { user: { id: string } } | null) => { // Explicitly type 'event' and 'session'
      if (session) {
        checkUser();
      } else {
        setUser(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleEvent);

    // Check for initial session
    checkUser();

    return () => {
      subscription?.unsubscribe(); // Ensure proper cleanup
    };
  }, [checkUser]);

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkUser,
    resetPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};