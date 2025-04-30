
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [logins, setLogins] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic admin check
    if (!user || user.id !== 1) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch login data
        const loginsResponse = await apiRequest("GET", "/api/admin/logins");
        const loginsData = await loginsResponse.json();
        setLogins(loginsData);
        
        // Fetch inquiries
        const inquiriesResponse = await apiRequest("GET", "/api/admin/inquiries");
        const inquiriesData = await inquiriesResponse.json();
        setInquiries(inquiriesData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading admin data...</h2>
          <p>Please wait while we fetch the information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="logins" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logins">User Logins ({logins.length})</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries ({inquiries.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle>User Login History</CardTitle>
              <CardDescription>Track user login activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of all user logins</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Login Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logins.length > 0 ? (
                    logins.map((login, index) => (
                      <TableRow key={index}>
                        <TableCell>{login.userId}</TableCell>
                        <TableCell>{login.email}</TableCell>
                        <TableCell>{new Date(login.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No login data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>User Inquiries</CardTitle>
              <CardDescription>Messages and inquiries from users about battery listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of all inquiries</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inquiry ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Battery ID</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.length > 0 ? (
                    inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell>{inquiry.id}</TableCell>
                        <TableCell>{inquiry.userId}</TableCell>
                        <TableCell>{inquiry.batteryId}</TableCell>
                        <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                        <TableCell>{inquiry.contactEmail || "N/A"}</TableCell>
                        <TableCell>{new Date(inquiry.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>{inquiry.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No inquiries available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
