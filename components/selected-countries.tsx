"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SelectedCountries() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get selected countries from URL query parameters
  const selectedCountries = searchParams.get("countries")?.split(",").filter(Boolean) || []

  if (selectedCountries.length === 0) {
    return null
  }

  // Remove a single country from selection
  const removeCountry = (country: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newCountries = selectedCountries.filter((c) => c !== country)

    if (newCountries.length > 0) {
      params.set("countries", newCountries.join(","))
    } else {
      params.delete("countries")
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Clear all selected countries
  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("countries")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedCountries.map((country) => (
        <div key={country} className="bg-[#ffeecc] text-primary px-3 py-1 rounded-full text-sm flex items-center">
          {country}
          <button className="ml-2 text-primary/70 hover:text-primary" onClick={() => removeCountry(country)}>
            ×
          </button>
        </div>
      ))}
      <button className="text-sm text-muted-foreground hover:text-primary underline" onClick={clearAll}>
        Clear all
      </button>
    </div>
  )
}

