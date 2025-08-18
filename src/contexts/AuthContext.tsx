import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface EvaluationHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  overallScore: number;
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
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  evaluationHistory: EvaluationHistory[];
  addEvaluation: (evaluation: EvaluationHistory) => void;
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

  useEffect(() => {
    // Load user from localStorage on app start
    const storedUser = localStorage.getItem('ladi_user');
    const storedHistory = localStorage.getItem('ladi_history');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedHistory) {
      setEvaluationHistory(JSON.parse(storedHistory));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app this would call an API
    if (email && password) {
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem('ladi_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Mock signup - in real app this would call an API
    if (email && password && name) {
      const mockUser = {
        id: Date.now().toString(),
        email,
        name
      };
      
      setUser(mockUser);
      localStorage.setItem('ladi_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ladi_user');
  };

  const addEvaluation = (evaluation: EvaluationHistory) => {
    const updatedHistory = [evaluation, ...evaluationHistory];
    setEvaluationHistory(updatedHistory);
    localStorage.setItem('ladi_history', JSON.stringify(updatedHistory));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      evaluationHistory,
      addEvaluation
    }}>
      {children}
    </AuthContext.Provider>
  );
};