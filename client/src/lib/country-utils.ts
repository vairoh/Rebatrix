// lib/country-utils.ts
import { Country, State } from "country-state-city";

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
  return Country.getAllCountries()
    .map((c) => ({
      name: c.name,
      code: c.isoCode,
      flag: getFlagEmoji(c.isoCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns all states/regions for the given country ISO code.
 */
export function getStatesForCountry(countryCode: string): string[] {
  const states = State.getStatesOfCountry(countryCode);
  return states.map((s) => s.name);
}
