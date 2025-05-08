import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { fadeIn } from "@/lib/motion";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getAllCountries } from "@/lib/country-utils";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { register, user } = useAuth();
  const [searchCountry, setSearchCountry] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    country: "Germany",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setLocation("/profile");
    }
  }, [user, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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

    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone number format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const userData = {
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
        country: formData.country
      };
      await register(userData);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-white px-4 py-6">
      <motion.div 
        className="w-[600px] bg-white p-6 border border-black rounded-lg"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold font-heading mb-1">Create an Account</h1>
          <p className="text-sm text-black/60">
            Join the battery marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-black'}`}
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
                  className={`w-full p-2 rounded-xl border ${formErrors.password ? 'border-red-500' : 'border-black'}`}
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
                  className={`w-full p-2 rounded-xl border ${formErrors.confirmPassword ? 'border-red-500' : 'border-black'}`}
                  placeholder="••••••••"
                />
                {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-black mb-1">
                  City/Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-xl border ${formErrors.location ? 'border-red-500' : 'border-black'}`}
                  placeholder="Berlin"
                />
                {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-black mb-1">
                  Country *
                </label>
                <div className="relative">
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger className={`border rounded-xl ${formErrors.country ? 'border-red-500' : 'border-black'}`}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start" side="bottom" sideOffset={5} className="max-h-[300px] w-[--radix-select-trigger-width] rounded-xl bg-white shadow-lg overflow-y-auto z-[999]">
                    <div className="sticky top-0 bg-white z-10 p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search country..."
                          value={searchCountry}
                          onChange={(e) => setSearchCountry(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      {getAllCountries()
                        .filter(country =>
                          country.name.toLowerCase().includes(searchCountry.toLowerCase())
                        )
                        .map((country) => (
                          <SelectItem key={country.code} value={country.name} className="rounded-lg">
                            <span className="mr-2">{country.flag}</span>
                            {country.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.country && <p className="text-xs text-red-500 mt-1">{formErrors.country}</p>}
              </div>

              <div className="relative">
                <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <PhoneInput
                    country={'de'}
                    value={formData.phone}
                    onChange={(phone) => handleSelectChange("phone", phone)}
                    containerClass="!w-full"
                    inputClass={`!w-full !h-10 !p-2 !pl-12 !rounded-xl !border ${formErrors.phone ? '!border-red-500' : '!border-black'} !bg-background !text-sm !ring-offset-background`}
                    buttonClass="!absolute !left-0 !h-10 !px-3 !border-0 !bg-transparent !rounded-l-xl"
                    enableSearch
                    searchPlaceholder="Search country code..."
                    dropdownClass="!w-[300px] !max-h-[200px] !overflow-y-auto !rounded-xl !border !border-black !mt-1"
                    searchClass="!m-0 !p-2 !sticky !top-0 !z-[100] !bg-white !border-b"
                    buttonStyle={{
                      background: 'transparent',
                      border: 'none'
                    }}
                    inputStyle={{
                      background: 'transparent',
                      width: '100%',
                      height: '40px'
                    }}
                    specialLabel=""
                  />
                </div>
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/20 flex justify-center">
            <Button 
              type="submit"
              className="bg-black text-white rounded-full px-8"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center text-sm mt-4">
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