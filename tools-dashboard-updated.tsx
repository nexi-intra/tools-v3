"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CountryFilter } from "@/components/country-filter"

// Tool type definition
type Tool = {
  id: string
  name: string
  icon: string
  country?: string
  isGeneral: boolean
  isFavorite: boolean
}

export default function ToolsDashboard() {
  // Sample tools data
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "1",
      name: "Nexi Connect",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "2",
      name: "myHR",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "3",
      name: "Success Factor",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "4",
      name: "Press Office",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "5",
      name: "How buy beer",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "6",
      name: "Doc&Go",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "7",
      name: "Self Service Request",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "8",
      name: "New Niels Gregers",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "9",
      name: "e-Procs: Protocol",
      icon: "/placeholder.svg?height=60&width=60",
      country: undefined,
      isGeneral: true,
      isFavorite: false,
    },
    {
      id: "10",
      name: "Active Contracts Library",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Italy",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "11",
      name: "ADP",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Italy",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "12",
      name: "Albert (CRM Salesforce)",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Italy",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "13",
      name: "Asset management (SIC)",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Italy",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "14",
      name: "Assocaaf / Il tuo Fisco",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Italy",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "15",
      name: "Expense Report",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Germany",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "16",
      name: "Travel Portal",
      icon: "/placeholder.svg?height=60&width=60",
      country: "France",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "17",
      name: "Payroll System",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Spain",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "18",
      name: "Benefits Portal",
      icon: "/placeholder.svg?height=60&width=60",
      country: "UK",
      isGeneral: false,
      isFavorite: false,
    },
  ])

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [includeGeneralTools, setIncludeGeneralTools] = useState(true)

  // Get unique countries from tools
  const countries = Array.from(new Set(tools.filter((tool) => tool.country).map((tool) => tool.country))) as string[]

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setTools(tools.map((tool) => (tool.id === id ? { ...tool, isFavorite: !tool.isFavorite } : tool)))
  }

  // Filter tools based on search, countries, and general tools inclusion
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountries.length === 0 || (tool.country && selectedCountries.includes(tool.country))
    const includeBasedOnType = tool.isGeneral ? includeGeneralTools : true

    return matchesSearch && matchesCountry && includeBasedOnType
  })

  // Get favorite tools
  const favoriteTools = tools.filter((tool) => tool.isFavorite)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Niels Gregers Johansen - Your Tools</h1>

      {/* Favorites section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-12">
        {favoriteTools.map((tool) => (
          <div key={tool.id} className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-blue-500">
              <img src={tool.icon || "/placeholder.svg"} alt={tool.name} className="w-10 h-10" />
            </div>
            <p className="text-sm font-medium line-clamp-2">{tool.name}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">All Tools</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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

        <CountryFilter countries={countries} selectedCountries={selectedCountries} onChange={setSelectedCountries} />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="grouptools"
            checked={includeGeneralTools}
            onCheckedChange={() => setIncludeGeneralTools(!includeGeneralTools)}
          />
          <label
            htmlFor="grouptools"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Include general tools
          </label>
        </div>
      </div>

      {/* Selected countries display */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCountries.map((country) => (
            <div key={country} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              {country}
              <button
                className="ml-2 text-primary/70 hover:text-primary"
                onClick={() => setSelectedCountries(selectedCountries.filter((c) => c !== country))}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="text-sm text-muted-foreground hover:text-primary underline"
            onClick={() => setSelectedCountries([])}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="border rounded-lg p-4 relative">
            {tool.country && (
              <span className="absolute top-2 left-2 bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                {tool.country}
              </span>
            )}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-yellow-500"
              onClick={() => toggleFavorite(tool.id)}
            >
              <Star className={tool.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} size={20} />
            </button>

            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 border-2 border-blue-500">
                <img src={tool.icon || "/placeholder.svg"} alt={tool.name} className="w-10 h-10" />
              </div>
              <p className="text-center font-medium">{tool.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

