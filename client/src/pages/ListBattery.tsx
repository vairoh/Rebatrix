import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Battery, InsertBattery } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { batteryTypes, batteryCategories, listingTypes } from "@shared/schema";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAllCountries, getStatesForCountry } from "@/lib/country-utils";

export default function ListBattery() {
  const [, navigate] = useLocation();
  const [searchCountry, setSearchCountry] = useState("");  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [listingType, setListingType] = useState("sell");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to list a battery",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, isLoading, navigate, toast]);

  // Get initial listing type from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type && (type === "sell" || type === "rent" || type === "lend")) {
      setListingType(type);
    }
  }, []);

  // Set SEO meta tags
  useEffect(() => {
    document.title = "List Your Battery | Rebatrix";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content", 
        "List your new, used, or second-life battery on Rebatrix. Connect with buyers across Europe looking for energy storage solutions."
      );
    }
  }, []);

  // Create a validation schema based on the shared insertBatterySchema
  const formSchema = z.object({
    userId: z.number().default(1), // Default to 1 for demo purposes
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
    price: z.string().min(1, "Price is required"),
    location: z.string().min(2, "Location is required"),
    country: z.string().min(2, "Country is required"),
    batteryType: z.enum([batteryTypes.NEW, batteryTypes.USED, batteryTypes.SECOND_LIFE]),
    category: z.enum([
      batteryCategories.RESIDENTIAL,
      batteryCategories.COMMERCIAL,
      batteryCategories.INDUSTRIAL,
      batteryCategories.GRID_SCALE,
      batteryCategories.EV,
      batteryCategories.SOLAR_INTEGRATION
    ]),
    capacity: z.string().min(1, "Capacity is required"),
    technologyType: z.string().min(2, "Technology type is required"),
    voltage: z.string().min(1, "Voltage is required"),
    currentRating: z.string().optional(),
    cycleCount: z.number().optional(),
    healthPercentage: z.number().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    manufacturer: z.string().min(2, "Manufacturer is required"),
    modelNumber: z.string().optional(),
    yearOfManufacture: z.number().optional(),
    warranty: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    listingType: z.enum([listingTypes.BUY, listingTypes.SELL, listingTypes.RENT, listingTypes.LEND]),
    availability: z.boolean().default(true),
    rentalPeriod: z.string().optional(),
    images: z.array(z.string()).default([]),
    additionalSpecs: z.record(z.string(), z.string()).optional(),
  });

  // Form setup with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1, // Default user ID for demo
      title: "",
      description: "",
      price: "",
      location: "",
      country: "",
      batteryType: batteryTypes.NEW,
      category: batteryCategories.RESIDENTIAL,
      capacity: "",
      technologyType: "",
      voltage: "",
      currentRating: "",
      cycleCount: 0,
      healthPercentage: 100,
      dimensions: "",
      weight: "",
      manufacturer: "",
      modelNumber: "",
      yearOfManufacture: new Date().getFullYear(),
      warranty: "",
      certifications: [],
      listingType: listingType as any, 
      availability: true,
      rentalPeriod: "",
      images: [],
      additionalSpecs: {},
    },
  });

  // Update form when listing type changes
  useEffect(() => {
    form.setValue("listingType", listingType as any);
  }, [listingType, form]);

  // Handle image upload placeholder
  const handleImageUpload = () => {
    // In a real app, this would handle file uploads to a server
    setUploadedImages(prev => [...prev, `placeholder-image-${prev.length + 1}`]);
    toast({
      title: "Image uploaded",
      description: "Your image has been successfully uploaded.",
    });
    form.setValue("images", [...uploadedImages, `placeholder-image-${uploadedImages.length + 1}`]);
  };

  // Handle certification input
  const [certification, setCertification] = useState("");
  const addCertification = () => {
    if (certification.trim()) {
      const currentCerts = form.getValues("certifications") || [];
      form.setValue("certifications", [...currentCerts, certification]);
      setCertification("");
    }
  };

  // Handle additional specs
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const addSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      const currentSpecs = form.getValues("additionalSpecs") || {};
      form.setValue("additionalSpecs", { ...currentSpecs, [specKey]: specValue });
      setSpecKey("");
      setSpecValue("");
    }
  };

  // Create battery mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertBattery) => {
      const res = await apiRequest("POST", "/api/batteries", data);
      return res.json();
    },
    onSuccess: (data: Battery) => {
      toast({
        title: "Battery listed successfully!",
        description: "Your battery has been added to the marketplace.",
      });
      // Force a small delay before navigation to ensure state updates
      setTimeout(() => {
        window.location.href = "/marketplace";
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error listing battery",
        description: error.message || "There was an error listing your battery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submission data:", data);
    try {
      // Auto-generate title from capacity and manufacturer
      const generatedTitle = `${data.capacity} kWh ${data.manufacturer} Battery`;
      
      const result = await mutation.mutateAsync({
        ...data,
        title: generatedTitle,
        description: "Battery energy storage system" // Add default description
      } as InsertBattery);
      console.log("Mutation result:", result);
    } catch (error) {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to submit battery listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-neutral-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-3">
              List Your Battery
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Connect with businesses across Europe looking for energy storage solutions.
              Fill out the form below to list your battery on our marketplace.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {/* Listing Type Selector */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">What would you like to do?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant={listingType === "sell" ? "default" : "outline"}
                    className={`h-auto py-4 flex flex-col items-center ${
                      listingType === "sell" ? "bg-black text-white" : "bg-white text-black border-black"
                    }`}
                    onClick={() => setListingType("sell")}
                  >
                    <i className="ri-coin-line text-2xl mb-2"></i>
                    <span className="font-medium">Sell Battery</span>
                  </Button>
                  <Button
                    variant={listingType === "rent" ? "default" : "outline"}
                    className={`h-auto py-4 flex flex-col items-center ${
                      listingType === "rent" ? "bg-black text-white" : "bg-white text-black border-black"
                    }`}
                    onClick={() => setListingType("rent")}
                  >
                    <i className="ri-time-line text-2xl mb-2"></i>
                    <span className="font-medium">Rent Battery</span>
                  </Button>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                      

                      

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {listingType === "rent" 
                                  ? `Price per ${form.getValues("rentalPeriod")?.replace("ly", "") || "Rental Period"} (€)*` 
                                  : "Price (€)*"}
                              </FormLabel>
                              <FormControl>
                                <Input type="text" placeholder="e.g. 5000" {...field} />
                              </FormControl>
                              {form.watch("capacity") && field.value && (
                                <div className="text-xs text-neutral-600 mt-1">
                                  Price per kWh: €{(Number(field.value) / Number(form.watch("capacity"))).toFixed(2)}/kWh
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {listingType === "rent" && (
                          <FormField
                            control={form.control}
                            name="rentalPeriod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rental Period*</FormLabel>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rental period" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country*</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue('location', '');
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>

                                {/* —— P A T C H E D   C O N T E N T —— */}
                                <SelectContent
                                  position="popper"
                                  align="start"
                                  side="bottom"
                                  sideOffset={5}
                                  avoidCollisions={false}
                                  className="max-h-[300px] w-[--radix-select-trigger-width] rounded-xl bg-white shadow-lg overflow-y-auto z-[999]"
                                >
                                  {/* sticky search bar */}
                                  <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                    <Input
                                      type="text"
                                      placeholder="Search country…"
                                      value={searchCountry}
                                      onChange={(e) => setSearchCountry(e.target.value)}
                                      className="rounded-xl"
                                    />
                                  </div>
                                  <div className="max-h-[300px] overflow-y-auto">
                                    {getAllCountries()
                                      .filter((c) =>
                                        c.name.toLowerCase().includes(searchCountry.toLowerCase())
                                      )
                                      .map((country) => (
                                        <SelectItem key={country.code} value={country.name}>
                                          <span className="mr-2">{country.flag}</span>
                                          {country.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  </SelectContent>
                                  {/* —— end patched content —— */}

                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State*</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                                disabled={!form.getValues('country')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={form.getValues('country') ? "Select state" : "Select country first"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getStatesForCountry(form.getValues('country')).map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Battery Details */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Battery Details</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="batteryType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Battery Type*</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={batteryTypes.NEW}>New</SelectItem>
                                  <SelectItem value={batteryTypes.USED}>Used</SelectItem>
                                  <SelectItem value={batteryTypes.SECOND_LIFE}>Second-Life</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category*</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={batteryCategories.RESIDENTIAL}>Residential</SelectItem>
                                  <SelectItem value={batteryCategories.COMMERCIAL}>Commercial</SelectItem>
                                  <SelectItem value={batteryCategories.INDUSTRIAL}>Industrial</SelectItem>
                                  <SelectItem value={batteryCategories.GRID_SCALE}>Grid-Scale</SelectItem>
                                  <SelectItem value={batteryCategories.EV}>EV</SelectItem>
                                  <SelectItem value={batteryCategories.SOLAR_INTEGRATION}>Solar Integration</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity (kWh)*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 13.5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voltage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voltage (V)*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 48" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Rating (A)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 125" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="technologyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Technology Type*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Lithium-Ion" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manufacturer*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Tesla" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="modelNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. PW2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="yearOfManufacture"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year of Manufacture</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={new Date().getFullYear().toString()} 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensions (HxWxD in cm)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 115x75x15" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 125" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {(form.getValues("batteryType") === batteryTypes.USED || 
                        form.getValues("batteryType") === batteryTypes.SECOND_LIFE) && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="cycleCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cycle Count</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g. 150" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="healthPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Health Percentage: {field.value}%</FormLabel>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value || 0]}
                                    onValueChange={(values) => field.onChange(values[0])}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="warranty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 10 years" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Certifications */}
                      <div>
                        <FormLabel>Certifications</FormLabel>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="e.g. CE, IEC 62619"
                            value={certification}
                            onChange={(e) => setCertification(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="border-black text-black hover:bg-gray-100"
                            onClick={addCertification}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.getValues("certifications")?.map((cert, index) => (
                            <div key={index} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                              {cert}
                              <button
                                type="button"
                                className="text-white hover:text-gray-300"
                                onClick={() => {
                                  const certs = form.getValues("certifications") || [];
                                  form.setValue(
                                    "certifications",
                                    certs.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Information */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Additional Information</h2>

                    {/* Additional Specs */}
                    <div className="mb-6">
                      <FormLabel>Additional Specifications</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Specification name"
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Value"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="border-black text-black hover:bg-gray-100"
                            onClick={addSpec}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <div className="bg-white border border-black p-4 rounded-md">
                        {Object.entries(form.getValues("additionalSpecs") || {}).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(form.getValues("additionalSpecs") || {}).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="font-medium">{key}:</span>
                                <div className="flex items-center">
                                  <span>{value}</span>
                                  <button
                                    type="button"
                                    className="ml-2 text-black hover:text-gray-600"
                                    onClick={() => {
                                      const specs = form.getValues("additionalSpecs") || {};
                                      const { [key]: _, ...rest } = specs;
                                      form.setValue("additionalSpecs", rest);
                                    }}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-black">No additional specifications added yet.</p>
                        )}
                      </div>
                    </div>


                  </div>

                  <Separator />

                  {/* Terms and Submit */}
                  <div>
                    <div className="flex items-start gap-2 mb-6">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-black">
                        I confirm that the information provided is accurate and agree to the 
                        <a href="/terms" className="text-black font-semibold hover:underline mx-1">Terms of Service</a> 
                        and <a href="/privacy" className="text-black font-semibold hover:underline">Privacy Policy</a>.
                      </label>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-black text-black hover:bg-gray-100"
                        onClick={() => navigate('/marketplace')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-black text-white hover:bg-gray-800" 
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Creating Listing...
                          </>
                        ) : (
                          <>List Your Battery</>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}