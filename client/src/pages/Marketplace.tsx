import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BatteryCard } from "@/components/batteries/BatteryCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Battery, BatterySearch } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { batteryTypes, batteryCategories, listingTypes } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Marketplace() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<BatterySearch>({});
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [capacityRange, setCapacityRange] = useState([0, 500]);

  // Extract initial filter from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    
    if (type && (type === "buy" || type === "sell" || type === "rent" || type === "lend")) {
      setSearchParams(prev => ({ ...prev, listingType: type }));
    }
  }, [location]);

  // Create the API query string based on the search parameters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (searchParams.query) params.append("q", searchParams.query);
    if (searchParams.batteryType) params.append("type", searchParams.batteryType);
    if (searchParams.category) params.append("category", searchParams.category);
    if (searchParams.listingType) params.append("listingType", searchParams.listingType);
    if (searchParams.manufacturer) params.append("manufacturer", searchParams.manufacturer);
    if (searchParams.location) params.append("location", searchParams.location);
    if (searchParams.country) params.append("country", searchParams.country);
    
    // Only add price/capacity range if they've been changed from defaults
    if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
    if (priceRange[1] < 100000) params.append("maxPrice", priceRange[1].toString());
    
    if (capacityRange[0] > 0) params.append("minCapacity", capacityRange[0].toString());
    if (capacityRange[1] < 500) params.append("maxCapacity", capacityRange[1].toString());
    
    return params.toString();
  };

  const queryString = buildQueryString();
  
  const { data: batteries, isLoading, error } = useQuery<Battery[]>({
    queryKey: [`/api/search?${queryString}`],
    enabled: true,
  });

  // Filter change handlers
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, query: e.target.value }));
  };

  const handleBatteryTypeChange = (value: string) => {
    if (value === "all-types") {
      setSearchParams(prev => {
        const { batteryType, ...rest } = prev;
        return rest;
      });
    } else {
      setSearchParams(prev => ({ ...prev, batteryType: value as "new" | "used" | "second-life" }));
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all-categories") {
      setSearchParams(prev => {
        const { category, ...rest } = prev;
        return rest;
      });
    } else {
      setSearchParams(prev => ({ ...prev, category: value as "residential" | "commercial" | "industrial" | "grid-scale" | "ev" | "solar-integration" }));
    }
  };

  const handleListingTypeChange = (value: string) => {
    if (value === "all-listings") {
      setSearchParams(prev => {
        const { listingType, ...rest } = prev;
        return rest;
      });
    } else {
      setSearchParams(prev => ({ ...prev, listingType: value as "buy" | "sell" | "rent" | "lend" }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, location: e.target.value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, country: e.target.value }));
  };

  const handleManufacturerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, manufacturer: e.target.value }));
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 100000]);
    setCapacityRange([0, 500]);
  };

  // Set SEO meta tags
  useEffect(() => {
    document.title = "Battery Marketplace | Rebatrix";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Browse our marketplace for battery energy storage systems (BESS) in Europe. Find new, used, and second-life batteries for sale or rental.");
    }
  }, []);

  return (
    <div className="py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-black mb-4">
            Battery Marketplace
          </h1>
          <p className="text-black max-w-4xl">
            Browse our comprehensive selection of battery energy storage systems. Find the perfect solution 
            for your residential, commercial, or industrial energy storage needs.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <motion.div 
            className="lg:w-1/4 bg-white p-6 rounded-lg shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading font-semibold text-lg">Filters</h2>
              <button 
                className="text-sm text-black hover:text-black underline"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>

            <div className="space-y-6">
              {/* Search filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Search
                </label>
                <Input
                  placeholder="Search batteries..."
                  value={searchParams.query || ""}
                  onChange={handleQueryChange}
                />
              </div>

              {/* Battery Type filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Battery Type
                </label>
                <Select 
                  value={searchParams.batteryType}
                  onValueChange={handleBatteryTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All types</SelectItem>
                    <SelectItem value={batteryTypes.NEW}>New</SelectItem>
                    <SelectItem value={batteryTypes.USED}>Used</SelectItem>
                    <SelectItem value={batteryTypes.SECOND_LIFE}>Second-life</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category
                </label>
                <Select 
                  value={searchParams.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All categories</SelectItem>
                    <SelectItem value={batteryCategories.RESIDENTIAL}>Residential</SelectItem>
                    <SelectItem value={batteryCategories.COMMERCIAL}>Commercial</SelectItem>
                    <SelectItem value={batteryCategories.INDUSTRIAL}>Industrial</SelectItem>
                    <SelectItem value={batteryCategories.GRID_SCALE}>Grid-scale</SelectItem>
                    <SelectItem value={batteryCategories.EV}>EV</SelectItem>
                    <SelectItem value={batteryCategories.SOLAR_INTEGRATION}>Solar Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Listing Type filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Listing Type
                </label>
                <Select 
                  value={searchParams.listingType}
                  onValueChange={handleListingTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All listings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-listings">All listings</SelectItem>
                    <SelectItem value={listingTypes.BUY}>Buy</SelectItem>
                    <SelectItem value={listingTypes.SELL}>Sell</SelectItem>
                    <SelectItem value={listingTypes.RENT}>Rent</SelectItem>
                    <SelectItem value={listingTypes.LEND}>Lend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price Range (€)
                </label>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 100000]}
                    min={0}
                    max={100000}
                    step={500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-neutral-500">
                  <span>€{priceRange[0].toLocaleString()}</span>
                  <span>€{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Capacity Range filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Capacity Range (kWh)
                </label>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 500]}
                    min={0}
                    max={500}
                    step={5}
                    value={capacityRange}
                    onValueChange={setCapacityRange}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-neutral-500">
                  <span>{capacityRange[0]} kWh</span>
                  <span>{capacityRange[1]} kWh</span>
                </div>
              </div>

              {/* Location filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="City"
                  value={searchParams.location || ""}
                  onChange={handleLocationChange}
                />
              </div>

              {/* Country filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Country
                </label>
                <Input
                  placeholder="Country"
                  value={searchParams.country || ""}
                  onChange={handleCountryChange}
                />
              </div>

              {/* Manufacturer filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Manufacturer
                </label>
                <Input
                  placeholder="Manufacturer"
                  value={searchParams.manufacturer || ""}
                  onChange={handleManufacturerChange}
                />
              </div>
            </div>
          </motion.div>

          {/* Battery listing results */}
          <div className="lg:w-3/4">
            {/* Active filters */}
            {Object.keys(searchParams).length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-neutral-700">Active filters:</span>
                {searchParams.query && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchParams.query}
                    <button 
                      className="ml-1"
                      onClick={() => setSearchParams(prev => ({ ...prev, query: undefined }))}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </Badge>
                )}
                {searchParams.batteryType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {searchParams.batteryType}
                    <button 
                      className="ml-1"
                      onClick={() => setSearchParams(prev => ({ ...prev, batteryType: undefined }))}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </Badge>
                )}
                {searchParams.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {searchParams.category}
                    <button 
                      className="ml-1"
                      onClick={() => setSearchParams(prev => ({ ...prev, category: undefined }))}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </Badge>
                )}
                {searchParams.listingType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Listing: {searchParams.listingType}
                    <button 
                      className="ml-1"
                      onClick={() => setSearchParams(prev => ({ ...prev, listingType: undefined }))}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-neutral-800">
                {isLoading ? (
                  "Loading batteries..."
                ) : batteries ? (
                  `${batteries.length} ${batteries.length === 1 ? "Battery" : "Batteries"} found`
                ) : (
                  "No batteries found"
                )}
              </h2>
            </div>

            {/* Results grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="h-48 bg-neutral-200 animate-pulse"></div>
                    <div className="p-5">
                      <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2 mb-3"></div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-black">
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-black mb-4">
                      <i className="ri-lock-line text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">Authentication Required</h3>
                    <p className="text-black mb-6 max-w-md mx-auto">
                      Please sign in to view all battery listings and details. Creating an account gives you access to
                      our complete marketplace.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="default"
                        className="bg-black text-white hover:bg-black rounded-full px-6" 
                        onClick={() => setLocation("/login")}
                      >
                        Sign In
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-red-500 mb-2">
                      <i className="ri-error-warning-line text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-1">Error loading batteries</h3>
                    <p className="text-black">Please try again later or adjust your search filters.</p>
                  </>
                )}
              </div>
            ) : batteries && batteries.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {batteries.map((battery) => (
                  <motion.div
                    key={battery.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                  >
                    <BatteryCard battery={battery} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-black">
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-black mb-4">
                      <i className="ri-lock-line text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">Authentication Required</h3>
                    <p className="text-black mb-6 max-w-md mx-auto">
                      Please sign in to view all battery listings and details. Creating an account gives you access to
                      our complete marketplace.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="default"
                        className="bg-black text-white hover:bg-black rounded-full px-6" 
                        onClick={() => setLocation("/login")}
                      >
                        Sign In
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-black mb-2">
                      <i className="ri-battery-low-line text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-1">No batteries found</h3>
                    <p className="text-black">Try adjusting your search filters or browse all batteries.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
