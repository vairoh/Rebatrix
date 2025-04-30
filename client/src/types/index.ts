import { 
  User as DrizzleUser, 
  Battery as DrizzleBattery,
  InsertUser as DrizzleInsertUser,
  InsertBattery as DrizzleInsertBattery,
  BatterySearch as DrizzleBatterySearch
} from "@shared/schema";

// Re-export types from shared schema
export type User = DrizzleUser;
export type Battery = DrizzleBattery;
export type InsertUser = DrizzleInsertUser;
export type InsertBattery = DrizzleInsertBattery;
export type BatterySearch = DrizzleBatterySearch;

// Theme types for UI consistency
export type ThemeColor = 
  | "primary" 
  | "secondary" 
  | "accent" 
  | "neutral" 
  | "success" 
  | "warning" 
  | "destructive";

// Battery display helpers
export const batteryTypeLabels = {
  "new": "New",
  "used": "Used",
  "second-life": "Second-Life"
};

export const batteryListingLabels = {
  "buy": "For Sale",
  "sell": "For Sale",
  "rent": "For Rent",
  "lend": "For Lending"
};

export const batteryCategoryLabels = {
  "residential": "Residential",
  "commercial": "Commercial",
  "industrial": "Industrial",
  "grid-scale": "Grid-Scale",
  "ev": "EV Battery",
  "solar-integration": "Solar Integration"
};

// SEO-related types
export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
}

// Additional custom types
export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imagePosition?: string;
  link: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface Stats {
  batteries: number;
  users: number;
  transactions: number;
  countries: number;
}

export interface InsertBattery extends Omit<Battery, 'id' | 'createdAt' | 'updatedAt'> {
}

export interface UpdateBattery extends Omit<Battery, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
}

export interface BatterySearch {
}