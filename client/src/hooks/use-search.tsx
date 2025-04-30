import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Battery } from "@/types";

export function useSearch(searchTerm: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch suggestions if debouncedSearchTerm is not empty
  const { data: searchResults, isLoading: isSearchLoading } = useQuery<Battery[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`],
    enabled: debouncedSearchTerm.length >= 2,
  });

  // Generate search suggestions
  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(isSearchLoading);

    if (searchResults) {
      // Generate suggestions based on the search results
      const uniqueSuggestions = new Set<string>();

      // Add battery title and manufacturer
      searchResults.forEach(battery => {
        uniqueSuggestions.add(battery.title);
        uniqueSuggestions.add(`${battery.technologyType} batteries`);
        uniqueSuggestions.add(`${battery.manufacturer} energy storage`);
        uniqueSuggestions.add(`${battery.capacity} kWh ${battery.category} battery`);
      });

      // Add search term with SEO-relevant terms if there are few results
      if (uniqueSuggestions.size < 3) {
        uniqueSuggestions.add(`${debouncedSearchTerm} battery storage`);
        uniqueSuggestions.add(`${debouncedSearchTerm} energy storage Germany`);
        uniqueSuggestions.add(`${debouncedSearchTerm} BESS solutions Europe`);
      }

      // Convert Set to array and limit results
      const suggestionsArray = Array.from(uniqueSuggestions).slice(0, 5);
      setSuggestions(suggestionsArray);
    } else if (!isSearchLoading) {
      // If no results but not loading, provide generic SEO-related suggestions
      const genericSuggestions = [
        `${debouncedSearchTerm} batteries`,
        `${debouncedSearchTerm} energy storage`,
        `${debouncedSearchTerm} BESS solutions`,
        `Second-life ${debouncedSearchTerm} batteries`,
        `${debouncedSearchTerm} battery systems Europe`
      ];
      setSuggestions(genericSuggestions);
    }
  }, [debouncedSearchTerm, searchResults, isSearchLoading]);

  return { suggestions, isLoading };
}

// Popular static suggestions for initial state
export const popularSearchTerms = [
  "Lithium-ion battery storage",
  "Second-life EV batteries",
  "Industrial BESS Germany",
  "Solar energy storage solutions",
  "Commercial battery systems",
  "Grid-scale energy storage",
  "Battery Energy Storage Systems Europe"
];
