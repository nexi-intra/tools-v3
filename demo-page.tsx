"use client"

import { useState } from "react"
import RedirectConfig from "./redirect-config"

export default function DemoPage() {
  const [homePageUrl, setHomePageUrl] = useState("")

  const handleSave = (language: string) => {
    // In a real application, you might construct the URL based on the language
    // or fetch it from an API
    setHomePageUrl(`/dashboard?lang=${language}`)
  }

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
  ]

  return (
    <RedirectConfig
      defaultLanguage="en"
      homePageUrl={homePageUrl}
      availableLanguages={availableLanguages}
      onSave={handleSave}
    />
  )
}

