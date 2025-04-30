import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const batteryTypes = [
  "Lithium-Ion",
  "LiFePO4",
  "Lead-Acid",
  "Flow Battery",
  "NiMH",
  "Sodium-Ion",
  "Other"
];

export const batteryCategories = [
  "Residential",
  "Commercial",
  "Industrial",
  "Grid-Scale",
  "EV",
  "Solar",
  "Backup",
  "UPS"
];

export const batteryConditions = [
  { value: "new", label: "New", color: "green" },
  { value: "used", label: "Used", color: "blue" },
  { value: "second-life", label: "Second-Life", color: "purple" },
  { value: "rental", label: "Rental", color: "amber" }
];

export const europeanCountries = [
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "United Kingdom",
  "Poland",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Portugal",
  "Ireland",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Greece"
];

export const formatCurrency = (amount: number, currency = "EUR") => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency 
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Used for generating SEO-friendly URL slugs
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
