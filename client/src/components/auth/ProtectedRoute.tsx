import { ReactNode, useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

// ProtectedRoute that works with wouter <Route> elements 
export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Show the route with authentication check
  return (
    <Route path={path}>
      {(params) => {
        // While loading auth state
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          );
        }
        
        // If no user, redirect
        if (!user) {
          // Display a notification
          toast({
            title: "Authentication required",
            description: "Please log in to access this page",
            variant: "destructive",
          });
          
          // Redirect
          useEffect(() => {
            navigate("/login");
          }, []);
          
          return null;
        }
        
        // User is authenticated, render the component
        return <Component />;
      }}
    </Route>
  );
}

// Wrapper component for child elements
export function ProtectedContent({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  // If user is authenticated, render the children
  return user ? <>{children}</> : null;
}