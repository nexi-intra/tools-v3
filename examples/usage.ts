import { apiEndpoints } from "@/lib/api-schema"
import { createApiClient } from "@/lib/api-client-generator"
import { generateMarkdownDocs } from "@/lib/api-docs-generator"

// Example: Generate API documentation
const apiDocs = generateMarkdownDocs(apiEndpoints)
console.log(apiDocs)

// Example: Create and use the API client
const apiClient = createApiClient(apiEndpoints)

async function fetchTool(id: number) {
  try {
    const tool = await apiClient.getToolById({ id: String(id) })
    console.log("Tool:", tool)
    return tool
  } catch (error) {
    console.error("Error fetching tool:", error)
  }
}

// Usage
fetchTool(1)

