// lib/country-utils.ts

import countriesData from "world-countries";
import { getStatesForCountry as originalGetStates } from "./countries";

export type CountryOption = {
  name: string;
  code: string;
  flag: string;
};

function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
    .map((cp) => String.fromCodePoint(cp))
    .join("");
}

/**
 * Returns all countries (name, code, emoji flag), sorted A→Z.
 */
export function getAllCountries(): CountryOption[] {
  return countriesData
    .map((c) => ({
      name: c.name.common,
      code: c.cca2,
      flag: getFlagEmoji(c.cca2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns all states/regions for the given country name
 * (delegates to your existing lib/countries:getStatesForCountry).
 */
export function getStatesForCountry(countryName: string): string[] {
  return originalGetStates(countryName);
}
