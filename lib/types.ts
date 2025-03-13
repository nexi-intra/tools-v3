export interface BrokerRequest {
  timeout?: number
  async?: boolean
  token: string
  body: any
}

export interface BrokerResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

export interface ServiceInfo {
  name: string
  purpose: string
  tags: string[]
}

export interface DiscoverRequest {
  nameFilter?: string
  purposeFilter?: string
  tags?: string[]
  page?: number
  pageSize?: number
  token: string
}

export interface DiscoverResponse {
  services: ServiceInfo[]
  pagination: {
    page: number
    pageSize: number
    totalServices: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface EndpointParameter {
  name: string
  type: string
  required: boolean
  description: string
}

export interface SchemaProperty {
  type: string
  description: string
  format?: string
}

export interface ResponseSchema {
  type: string
  properties: Record<string, SchemaProperty>
}

export interface EndpointInfo {
  name: string
  description: string
  parameters: EndpointParameter[]
  responseSchema: ResponseSchema
  version: string
  deprecated: boolean
}

export interface EndpointDiscoverRequest {
  nameFilter?: string
  versionFilter?: string
  includeDeprecated?: boolean
  page?: number
  pageSize?: number
  token: string
}

export interface EndpointDiscoverResponse {
  service: string
  endpoints: EndpointInfo[]
  pagination: {
    page: number
    pageSize: number
    totalEndpoints: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

