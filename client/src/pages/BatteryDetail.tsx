import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Battery } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BatteryLevel } from "@/components/batteries/BatteryLevel";
import { fadeIn, itemVariants } from "@/lib/motion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function BatteryDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const batteryId = parseInt(id || "0");

  const { data: battery, isLoading, error } = useQuery<Battery>({
    queryKey: [`/api/batteries/${batteryId}`],
    enabled: !isNaN(batteryId) && batteryId > 0,
  });

  const [showContactForm, setShowContactForm] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
  });
  
  // Handler for contact seller button - checks for authentication
  const handleContactSellerClick = () => {
    if (!user) {
      // User is not authenticated, show toast notification and redirect to login
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the seller",
        variant: "destructive"
      });
      navigate("/login");
    } else {
      // User is authenticated, show contact form
      setShowContactForm(true);
    }
  };

  // Set SEO meta tags
  useEffect(() => {
    if (battery) {
      document.title = `${battery.title} | Rebatrix Battery Marketplace`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content", 
          `${battery.batteryType} ${battery.manufacturer} ${battery.title} - ${battery.capacity} kWh ${battery.technologyType} battery. ${battery.description.slice(0, 150)}...`
        );
      }
    }
  }, [battery]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'second-life':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getListingTypeText = (type: string) => {
    switch (type) {
      case 'buy':
      case 'sell':
        return 'For Sale';
      case 'rent':
        return 'For Rent';
      case 'lend':
        return 'For Lending';
      default:
        return 'Available';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the inquiry to the backend
    alert("Your inquiry has been sent! The battery owner will contact you soon.");
    setShowContactForm(false);
    setFormValues({
      name: "",
      company: "",
      email: "",
      message: "",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-neutral-200 rounded-lg animate-pulse mb-6"></div>
          <div className="h-10 bg-neutral-200 rounded animate-pulse mb-4 w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2 w-1/2"></div>
          <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2 w-2/3"></div>
          <div className="h-4 bg-neutral-200 rounded animate-pulse mb-8 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-64 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !battery) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center flex-col text-center">
              <div className="text-red-500 mb-4">
                <i className="ri-error-warning-line text-5xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Battery Not Found</h1>
              <p className="mb-6 text-gray-600">
                We couldn't find the battery you're looking for. It may have been removed or the ID is incorrect.
              </p>
              <Link href="/marketplace">
                <Button>
                  Return to Marketplace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center text-sm text-neutral-600">
            <Link href="/">
              <a className="hover:text-primary-600">Home</a>
            </Link>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <Link href="/marketplace">
              <a className="hover:text-primary-600">Marketplace</a>
            </Link>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <span className="text-neutral-800 font-medium">{battery.title}</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div>
              {/* Battery details */}
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={`px-2 py-1 text-xs font-semibold ${getBadgeColor(battery.batteryType)} rounded-full`}>
                    {battery.batteryType === 'new' ? 'New' : 
                     battery.batteryType === 'used' ? 'Used' : 'Second-Life'}
                  </Badge>
                  <Badge className="px-2 py-1 text-xs font-semibold bg-accent-100 text-accent-800 rounded-full">
                    {getListingTypeText(battery.listingType)}
                  </Badge>
                </div>

                <motion.h1 
                  className="text-2xl md:text-3xl font-heading font-bold text-neutral-800 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {battery.title}
                </motion.h1>

                <motion.div 
                  className="flex items-center gap-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-2xl font-semibold text-primary-500">
                    {battery.listingType === 'rent' || battery.listingType === 'lend' 
                      ? `€${Number(battery.price).toLocaleString()}/mo`
                      : `€${Number(battery.price).toLocaleString()}`}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <i className="ri-map-pin-line"></i>
                    <span>{battery.location}, {battery.country}</span>
                  </div>
                </motion.div>

                <motion.p 
                  className="text-neutral-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {battery.description}
                </motion.p>

                <Separator className="my-6" />

                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: { 
                        staggerChildren: 0.1,
                        delayChildren: 0.4,
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Capacity</span>
                    <span className="font-semibold">{battery.capacity} kWh</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Technology</span>
                    <span className="font-semibold">{battery.technologyType}</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Voltage</span>
                    <span className="font-semibold">{battery.voltage} V</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Manufacturer</span>
                    <span className="font-semibold">{battery.manufacturer}</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Year</span>
                    <span className="font-semibold">{battery.yearOfManufacture || 'N/A'}</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <span className="text-sm text-neutral-500">Health</span>
                    <div className="flex items-center gap-2">
                      <BatteryLevel percentage={battery.healthPercentage || 100} />
                      <span className="font-semibold">{battery.healthPercentage || 100}%</span>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex flex-wrap gap-3 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {battery.category && (
                    <Badge variant="outline" className="bg-neutral-100">
                      {battery.category.charAt(0).toUpperCase() + battery.category.slice(1)}
                    </Badge>
                  )}
                  {battery.technologyType && (
                    <Badge variant="outline" className="bg-neutral-100">
                      {battery.technologyType}
                    </Badge>
                  )}
                  {battery.warranty && (
                    <Badge variant="outline" className="bg-neutral-100">
                      {battery.warranty} Warranty
                    </Badge>
                  )}
                </motion.div>

                <motion.div 
                  className="flex flex-wrap gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button 
                    size="lg" 
                    className="flex items-center gap-2"
                    onClick={handleContactSellerClick}
                  >
                    <i className="ri-mail-line"></i>
                    Contact Seller
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <i className="ri-heart-line"></i>
                    Save
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Detailed specifications */}
            <div className="p-6 md:p-8 border-t border-neutral-200">
              <Tabs defaultValue="specifications">
                <TabsList className="mb-6">
                  <TabsTrigger value="specifications">Technical Specifications</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping & Availability</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specifications">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Category</span>
                      <span className="font-medium">{battery.category.charAt(0).toUpperCase() + battery.category.slice(1)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Technology Type</span>
                      <span className="font-medium">{battery.technologyType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Capacity</span>
                      <span className="font-medium">{battery.capacity} kWh</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Voltage</span>
                      <span className="font-medium">{battery.voltage} V</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Current Rating</span>
                      <span className="font-medium">{battery.currentRating || 'N/A'} A</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Cycle Count</span>
                      <span className="font-medium">{battery.cycleCount || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Health Percentage</span>
                      <span className="font-medium">{battery.healthPercentage || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Dimensions</span>
                      <span className="font-medium">{battery.dimensions || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Weight</span>
                      <span className="font-medium">{battery.weight ? `${battery.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Manufacturer</span>
                      <span className="font-medium">{battery.manufacturer}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Model Number</span>
                      <span className="font-medium">{battery.modelNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Year of Manufacture</span>
                      <span className="font-medium">{battery.yearOfManufacture || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Warranty</span>
                      <span className="font-medium">{battery.warranty || 'N/A'}</span>
                    </div>
                    {/* Additional Specs if available */}
                    {battery.additionalSpecs && typeof battery.additionalSpecs === 'object' && 
                      Object.entries(battery.additionalSpecs as Record<string, string>).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-neutral-100">
                          <span className="text-neutral-600">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="certifications">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Certification Information</h3>
                    {battery.certifications && battery.certifications.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {battery.certifications.map((cert, index) => (
                          <li key={index} className="text-neutral-700">{cert}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-neutral-600">No certification details available for this battery.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="shipping">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Availability & Shipping</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-neutral-700 mb-2">
                          <span className="font-medium">Availability:</span> {battery.availability ? 'In Stock' : 'Out of Stock'}
                        </p>
                        {battery.listingType === 'rent' && battery.rentalPeriod && (
                          <p className="text-neutral-700 mb-2">
                            <span className="font-medium">Rental Period:</span> {battery.rentalPeriod}
                          </p>
                        )}
                        <p className="text-neutral-700 mb-4">
                          <span className="font-medium">Location:</span> {battery.location}, {battery.country}
                        </p>
                        <div className="bg-neutral-50 p-4 rounded-md">
                          <p className="text-sm text-neutral-600">
                            Due to the nature of battery products, shipping arrangements are made directly with the seller after purchase. Special handling may be required.
                          </p>
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Seller Information</h4>
                        <p className="text-sm text-neutral-600 mb-4">
                          Contact the seller for more information about this battery, shipping options, or to arrange an inspection.
                        </p>
                        <Button 
                          className="w-full"
                          onClick={handleContactSellerClick}
                        >
                          Contact Seller
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Contact form modal */}
          {showContactForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-lg shadow-lg max-w-md w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Contact the Seller</h3>
                    <button 
                      className="text-neutral-500 hover:text-neutral-700"
                      onClick={() => setShowContactForm(false)}
                    >
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitInquiry}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formValues.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formValues.company}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formValues.message}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`I'm interested in this ${battery.title}. Please provide more information.`}
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowContactForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Send Inquiry
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {/* Similar batteries section */}
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold mb-6">Similar Batteries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
                <p className="text-neutral-500">Similar batteries will be displayed here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
