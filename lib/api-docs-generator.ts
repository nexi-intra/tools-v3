import type { ApiEndpoints } from "./api-schema"

type EndpointDoc = {
  method: string
  path: string
  params?: Record<string, any>
  query?: Record<string, any>
  body?: Record<string, any>
  response: Record<string, any>
  errors: Record<string, string>
}

export function generateApiDocs(endpoints: ApiEndpoints): Record<string, EndpointDoc> {
  const docs: Record<string, EndpointDoc> = {}

  for (const [name, endpoint] of Object.entries(endpoints)) {
    const schema = endpoint as any

    docs[name] = {
      method: schema.method,
      path: schema.path,
      params: schema.params?._def?.shape || {},
      query: schema.query?._def?.shape || {},
      body: schema.body?._def?.shape || {},
      response: schema.response?._def?.shape || (schema.response?._def?.typeName === "ZodNull" ? null : {}),
      errors: schema.errors || {},
    }
  }

  return docs
}

// Generate markdown documentation
export function generateMarkdownDocs(endpoints: ApiEndpoints): string {
  const docs = generateApiDocs(endpoints)
  let markdown = "# API Documentation\n\n"

  for (const [name, endpoint] of Object.entries(docs)) {
    markdown += `## ${name}\n\n`
    markdown += `**Method:** ${endpoint.method}\n\n`
    markdown += `**Path:** ${endpoint.path}\n\n`

    if (endpoint.params && Object.keys(endpoint.params).length > 0) {
      markdown += "### Path Parameters\n\n"
      markdown += "| Name | Type | Description |\n"
      markdown += "|------|------|-------------|\n"

      for (const [paramName, paramSchema] of Object.entries(endpoint.params)) {
        markdown += `| ${paramName} | ${paramSchema.typeName || "any"} | - |\n`
      }

      markdown += "\n"
    }

    markdown += "### Response\n\n"
    markdown += "```json\n"
    markdown += JSON.stringify(endpoint.response, null, 2)
    markdown += "\n```\n\n"

    if (endpoint.errors && Object.keys(endpoint.errors).length > 0) {
      markdown += "### Errors\n\n"
      markdown += "| Status | Description |\n"
      markdown += "|--------|-------------|\n"

      for (const [status, description] of Object.entries(endpoint.errors)) {
        markdown += `| ${status} | ${description} |\n`
      }

      markdown += "\n"
    }
  }

  return markdown
}

