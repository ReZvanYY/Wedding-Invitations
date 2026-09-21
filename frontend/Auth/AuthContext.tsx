import { createContext, useContext, useState, useEffect, } from 'react';
import type { ReactNode } from 'react';
// 1. Define the User type based on your MySQL `users` table
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// 2. Define the state and functions, now including the token
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
}

// 3. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Create the Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for an existing token and user on app load
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('wedding_accessToken');
        const storedUser = localStorage.getItem('wedding_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Note: In a production app, you would ideally verify this token with your backend here
          // e.g., fetch('/api/verify', { headers: { Authorization: `Bearer ${storedToken}` } })
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        // If data is corrupted, clear it out to prevent app crashes
        localStorage.removeItem('wedding_accessToken');
        localStorage.removeItem('wedding_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 5. Update login to accept and save the accessToken
  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    
    // Persist to localStorage so the user stays logged in
    localStorage.setItem('wedding_user', JSON.stringify(userData));
    localStorage.setItem('wedding_accessToken', accessToken);
  };

  // 6. Update logout to wipe the accessToken
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wedding_user');
    localStorage.removeItem('wedding_accessToken');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isAuthenticated: !!token, // Authentication is now verified by the presence of a token
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 7. Custom Hook for easy access
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}