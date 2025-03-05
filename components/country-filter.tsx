"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SupportedLanguage, useLanguage } from "@/contexts/language-context";
import { z } from "zod"

interface CountryFilterProps {
  countries: string[]
}
const translationSchema = z.object({
  filterByCountry: z.string(),
  country: z.string(),
  countries: z.string(),
  countriesHeading: z.string(),
  noCountriesFound: z.string(),
  searchCountries: z.string(),
  clearSelection: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    filterByCountry: "Filter by country",
    country: "country",
    countries: "countries",
    countriesHeading: "Countries",
    noCountriesFound: "No countries found",
    searchCountries: "Search countries",
    clearSelection: "Clear selection",

  },
  da: {
    filterByCountry: "Filtrer efter land",
    country: "land",
    countries: "lande",
    countriesHeading: "Lande",
    noCountriesFound: "Ingen lande fundet",
    searchCountries: "Søg lande",
    clearSelection: "Ryd valg",
  },
  it: {
    filterByCountry: "Filtra per paese",
    country: "paese",
    countries: "paesi",
    countriesHeading: "Paesi",
    noCountriesFound: "Nessun paese trovato",
    searchCountries: "Cerca paesi",
    clearSelection: "Cancella selezione",

  }
};

export function CountryFilter({ countries }: CountryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get selected countries from URL query parameters
  const selectedCountries = searchParams.get("countries")?.split(",").filter(Boolean) || []

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setCountrySearch("")
    }
  }, [isOpen])

  // Update URL with selected countries
  const updateUrlWithCountries = (countries: string[]) => {
    const params = new URLSearchParams(searchParams.toString())

    if (countries.length > 0) {
      params.set("countries", countries.join(","))
    } else {
      params.delete("countries")
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Toggle a country selection
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      updateUrlWithCountries(selectedCountries.filter((c) => c !== country))
    } else {
      updateUrlWithCountries([...selectedCountries, country])
    }
  }

  // Clear all selections
  const clearSelections = () => {
    updateUrlWithCountries([])
  }

  // Filter countries based on search
  const filteredCountries = countries.filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()))

  return (
    <div className="relative" ref={ref} id="country-dropdown">
      <Button variant="outline" className="w-[180px] justify-between" onClick={() => setIsOpen(!isOpen)}>
        {selectedCountries.length === 0
          ? t.filterByCountry
          : `${selectedCountries.length} ${selectedCountries.length === 1 ? t.country : t.countries}`}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-[250px] rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <div className="mb-2 px-2 py-1.5 text-sm font-semibold">{t.countriesHeading}</div>

            {/* Country search input */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <Input
                ref={inputRef}
                type="text"
                placeholder={t.searchCountries}
                className="pl-7 py-1 h-8 text-sm"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
            </div>

            {/* Country list with scrollbar */}
            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div key={country} className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted">
                    <Checkbox
                      id={`country-${country}`}
                      checked={selectedCountries.includes(country)}
                      onCheckedChange={() => toggleCountry(country)}
                    />
                    <label htmlFor={`country-${country}`} className="flex-grow text-sm cursor-pointer">
                      {country}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-2">{t.noCountriesFound}</div>
              )}
            </div>

            {selectedCountries.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={clearSelections}>
                {t.clearSelection}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

