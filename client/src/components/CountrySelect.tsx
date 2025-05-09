import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAllCountries } from "@/lib/country-utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function CountrySelect({ value, onChange, placeholder = "Select country" }: Props) {
  const [search, setSearch] = useState("");

  const countries = useMemo(() => getAllCountries(), []);
  const filtered = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [countries, search]
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border rounded-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        align="start"
        sideOffset={5}
        className="w-[--radix-select-trigger-width] max-h-[300px] rounded-xl bg-white shadow-lg overflow-y-auto z-[999]"
      >
        <div className="sticky top-0 z-10 bg-white p-2 border-b">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country…"
            className="rounded-xl"
          />
        </div>

        {filtered.map((c) => (
          <SelectItem key={c.code} value={c.name}>
            <span className="mr-2">{c.flag}</span>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
