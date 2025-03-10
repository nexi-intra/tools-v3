import type { ApiEndpoints } from "./api-schema"
import type { z } from "zod"

type ApiClientOptions = {
  baseUrl?: string
  headers?: Record<string, string>
}

export function createApiClient<T extends ApiEndpoints>(endpoints: T, options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl || ""
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const client = {} as {
    [K in keyof T]: (...args: any[]) => Promise<z.infer<T[K]["response"]>>
  }

  for (const [name, endpoint] of Object.entries(endpoints)) {
    const { method, path, params, query, body, response } = endpoint as any

    client[name as keyof T] = async (...args: any[]) => {
      let url = `${baseUrl}${path}`
      let requestBody: any = undefined
      let queryParams: Record<string, string> = {}

      // Handle path parameters
      if (params) {
        const pathParams = args[0] || {}
        const validatedParams = params.parse(pathParams)

        for (const [key, value] of Object.entries(validatedParams)) {
          url = url.replace(`:${key}`, encodeURIComponent(String(value)))
        }
      }

      // Handle query parameters
      if (query && args[1]) {
        const validatedQuery = query.parse(args[1])
        queryParams = validatedQuery

        const queryString = new URLSearchParams(
          Object.entries(validatedQuery).map(([k, v]) => [k, String(v)]),
        ).toString()

        if (queryString) {
          url += `?${queryString}`
        }
      }

      // Handle request body
      if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        const bodyArg = query ? args[2] : args[1]
        if (bodyArg) {
          requestBody = JSON.stringify(body.parse(bodyArg))
        }
      }

      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: requestBody,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      return data
    }
  }

  return client
}

