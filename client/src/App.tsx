import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import BatteryDetail from "@/pages/BatteryDetail";
import ListBattery from "@/pages/ListBattery";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProtectedContent } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import EditBattery from "@/pages/EditBattery"; // Added import
import AdminDashboard from "./pages/AdminDashboard"; // Added import

// Create a client
const queryClient = new QueryClient();

// Protected page components
const ProtectedListBattery = () => (
  <ProtectedContent>
    <ListBattery />
  </ProtectedContent>
);

const ProtectedProfile = () => (
  <ProtectedContent>
    <Profile />
  </ProtectedContent>
);

// Placeholder for EditBattery component - needs to be implemented separately

function Router() {
  return (
    <>
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/battery/:id" component={BatteryDetail} />
          <Route path="/list-battery" component={ProtectedListBattery} />
          <Route path="/edit-battery/:id">
            {() => (
              <ProtectedContent>
                <EditBattery />
              </ProtectedContent>
            )}
          </Route>
          <Route path="/profile" component={ProtectedProfile} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/admin" component={AdminDashboard} /> {/* Added admin route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider queryClient={queryClient}>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;