import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "./copy-button"

export default function ServiceDiscoveryPrompt() {
  const prompt = `Create a POST request to the service discovery endpoint at /api/broker/service/discover with the following JSON payload:

\`\`\`json
{
  "token": "your-auth-token",
  "nameFilter": "user",
  "purposeFilter": "account",
  "tags": ["auth"],
  "page": 1,
  "pageSize": 10
}
\`\`\`

This will return a paginated list of available microservices matching the filters. The response will include:
- A list of services with their names, purposes, and tags
- Pagination information including total services, current page, and total pages

Example response:
\`\`\`json
{
  "services": [
    {
      "name": "user.create",
      "purpose": "Creates a new user account",
      "tags": ["user", "auth"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalServices": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
\`\`\`

You can omit any filter parameters to get all services.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Service Discovery Endpoint
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

