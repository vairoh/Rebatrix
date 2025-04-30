import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { fadeIn } from "@/lib/motion";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/profile");
    }
  }, [user, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Use auth hook for login
      try {
        await login(formData.email, formData.password);
      } catch (error) {
        setFormErrors(prev => ({
          ...prev,
          password: "Invalid email or password"
        }));
        return;
      }

      // Note: Redirect is handled in useEffect when user state changes

    } catch (error) {
      // Errors are handled by the login function itself with toast
      console.error("Login submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-white px-4">
      <motion.div 
        className="w-[380px] bg-white p-5 border border-black rounded-lg"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading mb-1.5">Login</h1>
          <p className="text-sm text-black/60">
            Sign in to access your rebatrix account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-black mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`w-full p-2 rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-black'}`}
              placeholder="youremail@example.com"
            />
            {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-black"
              >
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-black hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`w-full p-2 rounded-xl border ${formErrors.password ? 'border-red-500' : 'border-black'}`}
              placeholder="••••••••"
            />
            {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
          </div>

          <Button 
            type="submit"
            className="w-full bg-black text-white rounded-full py-2"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-black/60">Don't have an account?</span>{" "}
            <Link href="/signup" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}