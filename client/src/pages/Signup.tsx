import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { fadeIn } from "@/lib/motion";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { europeanCountries } from "@/lib/utils";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    location: "",
    country: "Germany"
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
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
    
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.country) errors.country = "Country is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Prepare data for API
      const { confirmPassword, ...userData } = formData;
      
      // Use auth hook to register
      await register(userData);
      
      // Redirect to profile page (handled in useEffect)
      // The user should be automatically logged in after registration
      
    } catch (error) {
      // Error handling is managed in the register function via toast
      console.error("Registration submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-white px-4 py-12">
      <motion.div 
        className="max-w-2xl w-full bg-white p-8 border border-black rounded-lg"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Create an Account</h1>
          <p className="text-sm text-black/60">
            Join the leading B2B marketplace for battery energy storage systems
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-black mb-1">
                    Username *
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.username ? 'border-red-500' : 'border-black'}`}
                    placeholder="yourusername"
                  />
                  {formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.email ? 'border-red-500' : 'border-black'}`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                    Password *
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.password ? 'border-red-500' : 'border-black'}`}
                    placeholder="••••••••"
                  />
                  {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.confirmPassword ? 'border-red-500' : 'border-black'}`}
                    placeholder="••••••••"
                  />
                  {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-black mb-1">
                    Company Name *
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.company ? 'border-red-500' : 'border-black'}`}
                    placeholder="Your Company Ltd."
                  />
                  {formErrors.company && <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border border-black"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-black mb-1">
                    City/Location *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${formErrors.location ? 'border-red-500' : 'border-black'}`}
                    placeholder="Berlin"
                  />
                  {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-black mb-1">
                    Country *
                  </label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger className={`border ${formErrors.country ? 'border-red-500' : 'border-black'}`}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {europeanCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.country && <p className="text-xs text-red-500 mt-1">{formErrors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-black/20">
            <Button 
              type="submit"
              className="w-full bg-black text-white rounded-full py-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-black/60">Already have an account?</span>{" "}
            <Link href="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}