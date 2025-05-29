
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'authority' | 'admin' | 'ngo';
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'citizen' | 'authority' | 'admin' | 'ngo';
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading profile for user:', authUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: 'citizen'
          });
        }
        return;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'citizen' | 'authority' | 'admin' | 'ngo',
          department: profile.department
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      
      // Check if this is the test account
      if (email === 'test@example.com' && password === 'password123') {
        console.log('Using test account credentials');
        // Create a mock session for test account
        const testUser = {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'citizen' as const
        };
        setUser(testUser);
        setSession({
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { name: 'Test User', role: 'citizen' }
          }
        } as any);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and confirm your account before logging in.' };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Login successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login.' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting registration for:', userData.email);
      
      // Validate password length
      if (userData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            name: userData.name,
            role: userData.role,
            department: userData.department
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'An account with this email already exists. Please try logging in instead.' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Registration successful:', data);
      
      // Create profile record if user was created successfully
      if (data.user && !data.session) {
        // User created but needs email confirmation
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: userData.department
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration.' };
    }
  };

  const logout = async () => {
    console.log('Logging out');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    isAuthenticated: !!session || !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
