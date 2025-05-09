// ✅ Updated: lib/country-utils.ts
import { Country, State } from "country-state-city";

export type CountryOption = {
  name: string;
  code: string; // ISO-2
  flag: string;
};

function getFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
    .map((cp) => String.fromCodePoint(cp))
    .join("");
}

/**
 * Returns a sorted list of all countries with name, ISO code, and flag.
 */
export function getAllCountries(): CountryOption[] {
  return Country.getAllCountries()
    .map((c) => ({
      name: c.name,
      code: c.isoCode,
      flag: getFlagEmoji(c.isoCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns all states/regions for the given ISO-2 country code.
 */
export function getStatesForCountry(isoCode: string): string[] {
  if (!isoCode) return [];
  return State.getStatesOfCountry(isoCode).map((s) => s.name);
}
