
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Battery, UpdateBattery } from "@/types";
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
import CountrySelect from "@/components/CountrySelect";
import { getStatesForCountry } from "@/lib/country-utils";

export default function EditBattery() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [listingType, setListingType] = useState("sell");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const batteryId = id ? (isNaN(parseInt(id)) ? id : parseInt(id)) : null;

  // Try to get battery data from sessionStorage first for faster loading
  const cachedBatteryData = batteryId ? sessionStorage.getItem(`battery-${batteryId}`) : null;
  const initialBatteryData = cachedBatteryData ? JSON.parse(cachedBatteryData) : null;

  // Fetch the battery data
  const { data: battery, isLoading: isBatteryLoading, error: batteryError } = useQuery<Battery>({
    queryKey: [`battery-edit-${batteryId}`],
    queryFn: async () => {
      console.log(`Fetching battery with ID: ${batteryId}`);
      
      // Use cached data first if available to prevent flickering
      if (initialBatteryData) {
        console.log("Using cached battery data initially");
        return initialBatteryData;
      }
      
      const response = await fetch(`/api/batteries/${batteryId}`);
      if (!response.ok) {
        console.error(`Failed to fetch battery: ${response.status} ${response.statusText}`);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        throw new Error(`Failed to fetch battery: ${response.status}`);
      }
      const data = await response.json();
      console.log("Battery data received:", data);
      
      // Cache the data for future use
      sessionStorage.setItem(`battery-${batteryId}`, JSON.stringify(data));
      return data;
    },
    initialData: initialBatteryData,
    enabled: !!batteryId,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Update form schema based on your Battery type
  const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    price: z.string().min(1, "Price is required"),
    batteryType: z.string(),
    category: z.string(),
    manufacturer: z.string().min(1, "Manufacturer is required"),
    capacity: z.string().min(1, "Capacity is required"),
    voltage: z.string().min(1, "Voltage is required"),
    currentRating: z.string().optional(),
    technologyType: z.string().min(1, "Technology type is required"),
    listingType: z.string(),
    location: z.string().min(1, "Location is required"),
    country: z.string().min(1, "Country is required"),
    description: z.string().optional(),
    yearOfManufacture: z.number().optional(),
    healthPercentage: z.number().optional(),
    cycleCount: z.number().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    modelNumber: z.string().optional(),
    warranty: z.string().optional(),
    rentalPeriod: z.string().optional(),
    availability: z.boolean().default(true),
  });

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      batteryType: batteryTypes.NEW,
      category: batteryCategories.RESIDENTIAL,
      manufacturer: "",
      capacity: "",
      voltage: "",
      currentRating: "",
      technologyType: "",
      listingType: "sell",
      location: "",
      country: "Germany",
      description: "",
      yearOfManufacture: new Date().getFullYear(),
      healthPercentage: 100,
      cycleCount: 0,
      weight: "",
      dimensions: "",
      modelNumber: "",
      warranty: "",
      rentalPeriod: "",
      availability: true,
    },
  });

  const selectedCountry = form.watch("country");

  // Update form values when battery data is loaded
  useEffect(() => {
    if (battery) {
      form.reset({
        title: battery.title,
        price: battery.price,
        batteryType: battery.batteryType,
        category: battery.category,
        manufacturer: battery.manufacturer,
        capacity: battery.capacity,
        voltage: battery.voltage,
        currentRating: battery.currentRating,
        technologyType: battery.technologyType,
        listingType: battery.listingType,
        location: battery.location,
        country: battery.country,
        description: battery.description,
        yearOfManufacture: battery.yearOfManufacture || new Date().getFullYear(),
        healthPercentage: battery.healthPercentage || 100,
        cycleCount: battery.cycleCount || 0,
        weight: battery.weight || "",
        dimensions: battery.dimensions || "",
        modelNumber: battery.modelNumber || "",
        warranty: battery.warranty || "",
        rentalPeriod: battery.rentalPeriod || "",
        availability: battery.availability || true,
      });
      
      setListingType(battery.listingType);
    }
  }, [battery, form]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit a battery listing",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, authLoading, navigate, toast]);

  // Check if user is the owner of this battery listing
  useEffect(() => {
    if (battery && user && battery.userId !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own battery listings",
        variant: "destructive",
      });
      navigate("/profile");
    }
  }, [battery, user, navigate, toast]);

  // Update listing type from form when it changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "listingType") {
        setListingType(value.listingType || "sell");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set SEO meta tags
  useEffect(() => {
    document.title = "Edit Battery Listing | Rebatrix";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content", 
        "Edit your battery listing on Rebatrix. Update details and information for your energy storage solution."
      );
    }
  }, []);

  // Update battery mutation
  const mutation = useMutation({
    mutationFn: async (data: UpdateBattery) => {
      // Add ID to the update data
      const updateData = { ...data, id: batteryId };
      
      // Using the apiRequest correctly - it takes method as first argument
      const response = await apiRequest("PUT", `/api/batteries/${batteryId}`, updateData);
      
      if (!response.ok) {
        throw new Error('Failed to update battery listing');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your battery listing has been updated",
      });
      navigate(`/battery/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update battery listing",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Auto-generate title from capacity and manufacturer
      const generatedTitle = `${data.capacity} kWh ${data.manufacturer} Battery`;
      
      await mutation.mutateAsync({
        ...data,
        title: generatedTitle,
        description: "Battery energy storage system"
      } as UpdateBattery);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (authLoading || isBatteryLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

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
              Edit Your Battery Listing
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Update the information for your battery listing to ensure it's up-to-date.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {/* Listing Type Selector */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Listing Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant={listingType === "sell" ? "default" : "outline"}
                    className={`h-auto py-4 flex flex-col items-center ${
                      listingType === "sell" ? "bg-black text-white" : "bg-white text-black border-black"
                    }`}
                    onClick={() => {
                      setListingType("sell");
                      form.setValue("listingType", "sell");
                    }}
                  >
                    <i className="ri-coin-line text-2xl mb-2"></i>
                    <span className="font-medium">Sell Battery</span>
                  </Button>
                  <Button
                    variant={listingType === "rent" ? "default" : "outline"}
                    className={`h-auto py-4 flex flex-col items-center ${
                      listingType === "rent" ? "bg-black text-white" : "bg-white text-black border-black"
                    }`}
                    onClick={() => {
                      setListingType("rent");
                      form.setValue("listingType", "rent");
                    }}
                  >
                    <i className="ri-time-line text-2xl mb-2"></i>
                    <span className="font-medium">Rent Battery</span>
                  </Button>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Main Listing Information */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (€)*</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <div className="flex justify-between">
                                  <FormDescription>
                                    {listingType === 'rent' ? 'Price per month' : 'Selling price'}
                                  </FormDescription>
                                  {form.watch("capacity") && field.value && (
                                    <div className="text-xs text-neutral-600">
                                      €{(Number(field.value) / Number(form.watch("capacity"))).toFixed(2)}/kWh
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {listingType === 'rent' && (
                            <FormField
                              control={form.control}
                              name="rentalPeriod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rental Period</FormLabel>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
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
                                    <SelectItem value={batteryCategories.AUTOMOTIVE}>Automotive</SelectItem>
                                    <SelectItem value={batteryCategories.PORTABLE}>Portable</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="manufacturer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Manufacturer*</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Tesla, LG, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="modelNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Model Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Model number" {...field} />
                                </FormControl>
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
                                  <Input placeholder="e.g. 250" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="technologyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Technology Type*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Lithium-Ion, LFP, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="dimensions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dimensions</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 1150 x 755 x 155 mm" {...field} />
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
                      </div>
                    </div>

                    <Separator />

                    {/* Condition Details (only for used batteries) */}
                    {form.watch("batteryType") !== batteryTypes.NEW && (
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Condition Details</h2>
                        <div className="space-y-6">
                          <div>
                            <FormField
                              control={form.control}
                              name="healthPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between mb-2">
                                    <FormLabel>Battery Health</FormLabel>
                                    <span className="text-sm">{field.value}%</span>
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={[field.value || 100]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    The current health percentage of the battery
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="cycleCount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cycle Count</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="e.g. 100" 
                                      {...field} 
                                      onChange={(e) => field.onChange(+e.target.value)}
                                    />
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
                                      placeholder="e.g. 2020" 
                                      {...field} 
                                      onChange={(e) => field.onChange(+e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="warranty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warranty Information</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 5 years remaining" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Location */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Location</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country*</FormLabel>
                              <CountrySelect
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("location", ""); // Reset city/state on country change
                                }}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State*</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!selectedCountry}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={selectedCountry ? "Select state" : "Select country first"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getStatesForCountry(selectedCountry || "").map((state) => (
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
                    
                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-black text-black hover:bg-gray-100"
                        onClick={() => navigate(`/battery/${batteryId}`)}
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
                            Updating Listing...
                          </>
                        ) : (
                          <>Update Listing</>
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
