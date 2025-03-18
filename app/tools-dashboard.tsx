"use client"

import { Star } from "lucide-react"
import { CountryFilter } from "@/components/country-filter"
import { SelectedCountries } from "@/components/selected-countries"
import { GroupToolsToggle } from "@/components/general-tools-toggle"
import { SearchInput } from "@/components/search-input"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

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
  const searchParams = useSearchParams()

  // Get filter states from URL query parameters
  const searchQuery = searchParams.get("q") || ""
  const selectedCountries = searchParams.get("countries")?.split(",").filter(Boolean) || []
  const includeGeneralTools = searchParams.get("grouptools") !== "false"

  // Sample tools data with all European countries
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
    {
      id: "19",
      name: "Local Tax System",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Austria",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "20",
      name: "Regional Portal",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Belgium",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "21",
      name: "HR Connect",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Bulgaria",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "22",
      name: "Local Benefits",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Croatia",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "23",
      name: "Compliance Portal",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Cyprus",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "24",
      name: "Regional Docs",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Czech Republic",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "25",
      name: "Local Intranet",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Denmark",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "26",
      name: "Regional HR",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Estonia",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "27",
      name: "Local Finance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Finland",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "28",
      name: "Regional Compliance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Greece",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "29",
      name: "Local Payroll",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Hungary",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "30",
      name: "Regional Benefits",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Ireland",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "31",
      name: "Local HR",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Latvia",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "32",
      name: "Regional Finance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Lithuania",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "33",
      name: "Local Compliance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Luxembourg",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "34",
      name: "Regional Payroll",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Malta",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "35",
      name: "Local Benefits",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Netherlands",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "36",
      name: "Regional HR",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Poland",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "37",
      name: "Local Finance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Portugal",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "38",
      name: "Regional Compliance",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Romania",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "39",
      name: "Local Payroll",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Slovakia",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "40",
      name: "Regional Benefits",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Slovenia",
      isGeneral: false,
      isFavorite: false,
    },
    {
      id: "41",
      name: "Local HR",
      icon: "/placeholder.svg?height=60&width=60",
      country: "Sweden",
      isGeneral: false,
      isFavorite: false,
    },
  ])

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
        <SearchInput label="Search" />
        <CountryFilter countries={countries} />
        <GroupToolsToggle />
      </div>

      {/* Selected countries display */}
      <SelectedCountries />

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

