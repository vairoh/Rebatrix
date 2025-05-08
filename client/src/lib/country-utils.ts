// lib/country-utils.ts
import countries from "world-countries";

export type CountryOption = {
  name: string;
  code: string;
  flag: string;
};

export const getAllCountries = (): CountryOption[] => {
  return countries.map((c) => ({
    name: c.name.common,
    code: c.cca2,
    flag: getFlagEmoji(c.cca2),
  }));
};

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
