import { z } from "zod"

// Define your API schemas
export const toolSchema = z.object({
  id: z.number().describe("The unique identifier for the tool"),
  name: z.string().describe("The name of the tool"),
  description: z.string().optional().describe("A description of the tool"),
  // Add other tool properties as needed
})

export type Tool = z.infer<typeof toolSchema>

// Define API endpoints
export const apiEndpoints = {
  getToolById: {
    method: "GET",
    path: "/api/tools/:id",
    params: z.object({
      id: z.string().transform((val) => Number.parseInt(val)),
    }),
    response: toolSchema.nullable(),
    errors: {
      400: "Invalid ID format",
      404: "Tool not found",
      500: "Failed to fetch tool",
    },
  },
  // Add other endpoints as needed
} as const

// Type for all API endpoints
export type ApiEndpoints = typeof apiEndpoints

