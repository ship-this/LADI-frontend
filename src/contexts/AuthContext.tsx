import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService, type LoginResponse, type EvaluationResponse, type EvaluationsResponse } from '../services/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface EvaluationHistory {
  id: number;
  fileName: string;
  uploadDate: string;
  overallScore: number;
  status: string;
  downloadUrl?: string;
  evaluations: Array<{
    id: string;
    title: string;
    score: number;
    summary: string;
    icon: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  evaluationHistory: EvaluationHistory[];
  addEvaluation: (evaluation: EvaluationHistory) => void;
  loadEvaluationHistory: (currentUser?: User) => Promise<void>;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingHistoryRef = useRef(false);

  useEffect(() => {
    // Check if user is authenticated on app start
    const token = localStorage.getItem('ladi_token');
    if (token && apiService.isAuthenticated()) {
      // Try to load user profile
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else if (response.error?.includes('expired') || response.error?.includes('Session expired')) {
        // Token expired, clear authentication
        console.log('Token expired, clearing authentication');
        logout();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // If profile load fails, clear authentication
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        
        // Load evaluation history after successful login
        await loadEvaluationHistory(userData);
        
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.signup({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        return true;
      } else {
        console.error('Signup failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setEvaluationHistory([]);
    apiService.logout();
  };

  const loadEvaluationHistory = useCallback(async (currentUser?: User) => {
    const userToUse = currentUser || user;
    if (!userToUse) return;
    
    if (loadingHistoryRef.current) {
      console.log('loadEvaluationHistory already in progress, skipping...');
      return;
    }
    
    console.log('loadEvaluationHistory called with user:', userToUse.id);
    loadingHistoryRef.current = true;
    try {
      // Clear old download URLs to ensure fresh AWS4 signatures
      try {
        await apiService.clearOldDownloadUrls();
        console.log('Cleared old download URLs');
      } catch (error) {
        console.warn('Failed to clear old download URLs:', error);
      }
      
      const response = await apiService.getEvaluations();
      if (response.success && response.data && response.data.evaluations) {
        const history = response.data.evaluations.map((evalData: EvaluationResponse) => ({
          id: evalData.id,
          fileName: evalData.original_filename,
          uploadDate: evalData.created_at,
          overallScore: evalData.overall_score || 0,
          status: evalData.status,
          // Don't store download URL - always get fresh ones with correct signature
          evaluations: evalData.evaluation_results?.categories ? 
            Object.entries(evalData.evaluation_results.categories).map(([key, value]: [string, any]) => ({
              id: key,
              title: getCategoryTitle(key),
              score: value.score || 0,
              summary: value.summary || '',
              icon: getCategoryIcon(key),
            })) : []
        }));
        
        setEvaluationHistory(history);
        console.log('Successfully loaded evaluation history:', history.length, 'evaluations');
      } else {
        console.error('Failed to load evaluation history:', response.error);
        // Set empty array if no evaluations found
        setEvaluationHistory([]);
      }
    } catch (error) {
      console.error('Failed to load evaluation history:', error);
      // Set empty array on error to prevent infinite loading
      setEvaluationHistory([]);
    } finally {
      loadingHistoryRef.current = false;
    }
  }, [user]);

  const addEvaluation = (evaluation: EvaluationHistory) => {
    setEvaluationHistory(prev => [evaluation, ...prev]);
  };

  const getCategoryTitle = (key: string): string => {
    const titles: Record<string, string> = {
      'line-editing': 'Line & Copy Editing',
      'plot': 'Plot Evaluation',
      'character': 'Character Evaluation',
      'flow': 'Book Flow Evaluation',
      'worldbuilding': 'Worldbuilding & Setting',
      'readiness': 'LADI Readiness Score',
    };
    return titles[key] || key;
  };

  const getCategoryIcon = (key: string): string => {
    const icons: Record<string, string> = {
      'line-editing': 'FileText',
      'plot': 'TrendingUp',
      'character': 'Users',
      'flow': 'Zap',
      'worldbuilding': 'Globe',
      'readiness': 'Star',
    };
    return icons[key] || 'FileText';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      evaluationHistory,
      addEvaluation,
      loadEvaluationHistory,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};