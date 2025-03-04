"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get search query from URL query parameters
  const urlSearchQuery = searchParams.get("q") || ""

  // Local state for the input value
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery)

  // Debounce the search query to avoid too many URL updates
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Update URL when debounced search query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearchQuery) {
      params.set("q", debouncedSearchQuery)
    } else {
      params.delete("q")
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }, [debouncedSearchQuery, router, searchParams])

  return (
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Search for"
        className="pl-10 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}

