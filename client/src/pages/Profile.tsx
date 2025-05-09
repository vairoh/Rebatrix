import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { fadeIn } from "@/lib/motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BatteryCard } from "@/components/batteries/BatteryCard";

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  // If no user and not loading, the redirect in useEffect will handle it
  if (!user) return null;

  // Fetch user's batteries
  const { data: userBatteries = [], isLoading: loadingBatteries } = useQuery({
    queryKey: [`/api/users/${user.id}/batteries`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/batteries`);
      if (!response.ok) throw new Error('Failed to fetch batteries');
      return response.json();
    },
    enabled: !!user?.id
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="w-full md:w-1/3">
            <div className="bg-white border border-black rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-4">
                  <span className="text-2xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="text-lg font-bold w-full overflow-hidden text-ellipsis max-w-full sm:max-w-[250px] whitespace-nowrap">
                  <span title={user.email}>{user.email}</span>
                </h2>
                <p className="text-xs text-black/60">{user.company}</p>
                <p className="text-xs mt-1">{user.location}, {user.country}</p>
              </div>

              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between mb-2 overflow-hidden text-ellipsis hover:overflow-visible w-full">
                  <span className="text-xs font-medium">Email</span>
                  <span className="text-xs max-w-[calc(100%-80px)] whitespace-nowrap overflow-hidden text-ellipsis" title={user.email}>
                    {user.email}
                  </span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Phone</span>
                    <span className="text-xs">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Member Since</span>
                  <span className="text-xs">
                    {user.createdAt 
                      ? (typeof user.createdAt === 'string' 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : user.createdAt instanceof Date 
                            ? user.createdAt.toLocaleDateString()
                            : new Date().toLocaleDateString())
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  variant="outline"
                  className="w-full border-black text-black hover:bg-black hover:text-white transition-colors mb-2"
                  onClick={() => setLocation("/list-battery")}
                >
                  List a Battery
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-black/50 text-black/80 hover:bg-black hover:text-white transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <h1 className="text-2xl font-bold mb-6">My Battery Listings</h1>

            {loadingBatteries ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              </div>
            ) : userBatteries.length === 0 ? (
              <div className="bg-white border border-black/20 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
                <p className="text-black/60 mb-6">
                  You haven't listed any batteries for sale or rent.
                </p>
                <Button
                  className="bg-black text-white rounded-full hover:bg-black/90"
                  onClick={() => setLocation("/list-battery")}
                >
                  List Your First Battery
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBatteries.map((battery) => (
                  <BatteryCard key={battery.id} battery={battery} />
                ))}
              </div>
            )}

            <h2 className="text-2xl font-bold mt-12 mb-6">Transaction History</h2>
            <div className="bg-white border border-black/20 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Transactions</h3>
              <p className="text-black/60">
                Your transaction history will appear here.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}