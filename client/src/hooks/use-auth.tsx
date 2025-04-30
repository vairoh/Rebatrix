import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/types";

// Create a context for authentication
const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Record<string, any>) => Promise<void>;
} | null>(null);

// Export provider for use in App.tsx
export function AuthProvider({ 
  children,
  queryClient
}: { 
  children: ReactNode;
  queryClient: QueryClient;
}) {
  // Get current user
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("auth_token");
        if (!token) return null;

        // Fetch the current user with token in header
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Clear token if unauthorized
            localStorage.removeItem("auth_token");
            return null;
          }
          throw new Error("Failed to fetch user data");
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false
  });

  // Log in a user
  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }
      
      const userData = await response.json();
      
      // Store token
      if (userData.token) {
        localStorage.setItem("auth_token", userData.token);
        
        // Refetch user data to update the context
        refetch();
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.username}`
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Register a new user
  const register = async (userData: Record<string, any>) => {
    try {
      const response = await apiRequest("POST", "/api/users", userData);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created"
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Log out the current user
  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Custom fetch for logout to include the token
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      // Clear token and invalidate queries
      localStorage.removeItem("auth_token");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout error",
        description: "There was a problem logging out",
        variant: "destructive"
      });
    }
  };

  // Set auth header automatically for all requests
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        init = init || {};
        init.headers = init.headers || {};
        
        // Don't override if Authorization is already set
        if (!(init.headers as any).Authorization) {
          (init.headers as any).Authorization = `Bearer ${token}`;
        }
        
        return originalFetch(input, init);
      };
      
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, []);

  // Provide the auth context
  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      isLoading, 
      error: error as Error | null, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}