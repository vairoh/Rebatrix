// lib/country-utils.ts
import countriesData from "world-countries";
import { Country, State } from "country-state-city";

export type CountryOption = {
  name: string;
  code: string;
  flag: string;
};

/**
 * Given an ISO country code (e.g., "DE"), return its 🇩🇪 emoji flag.
 */
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
 * Given a country **name** or **ISO-2 code**, return its states/regions.
 * Falls back gracefully if the code is unknown or the SDK has no data.
 */
export function getStatesForCountry(countryInput: string): string[] {
  if (!countryInput) return [];

  let isoCode: string | undefined;

  // ✅ If already an ISO-2 code like "DE"
  if (countryInput.length === 2) {
    isoCode = countryInput.toUpperCase();
  }

  // 🌍 Try to map name → ISO code using world-countries
  if (!isoCode) {
    const match = countriesData.find(
      (c) => c.name.common.toLowerCase() === countryInput.toLowerCase()
    );
    if (match) isoCode = match.cca2;
  }

  // 🧭 Fallback to SDK name match
  if (!isoCode) {
    const match = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === countryInput.toLowerCase()
    );
    if (match) isoCode = match.isoCode;
  }

  if (!isoCode) return [];

  return State.getStatesOfCountry(isoCode).map((s) => s.name);
}
