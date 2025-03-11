"use client"

import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocs() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      {isClient ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <SwaggerUI url="/api/openapi.json" />
        </div>
      ) : (
        <div>Loading documentation...</div>
      )}
    </div>
  )
}

