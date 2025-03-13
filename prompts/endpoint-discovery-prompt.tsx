import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "./copy-button"

export default function EndpointDiscoveryPrompt() {
  const prompt = `Create a POST request to the endpoint discovery endpoint at /api/broker/service/{service-name}/discover with the following JSON payload:

\`\`\`json
{
  "token": "your-auth-token",
  "nameFilter": "create",
  "versionFilter": "1.0.0",
  "includeDeprecated": false,
  "page": 1,
  "pageSize": 10
}
\`\`\`

Replace {service-name} with the name of the service you want to discover endpoints for (e.g., "user.create").

This will return a paginated list of available endpoints for the specified service. The response will include:
- The service name
- A list of endpoints with their names, descriptions, parameters, response schemas, versions, and deprecation status
- Pagination information

Example response:
\`\`\`json
{
  "service": "user.create",
  "endpoints": [
    {
      "name": "createUser",
      "description": "Creates a new user in the system",
      "parameters": [
        {
          "name": "username",
          "type": "string",
          "required": true,
          "description": "Unique username for the user"
        },
        {
          "name": "email",
          "type": "string",
          "required": true,
          "description": "Email address of the user"
        }
      ],
      "responseSchema": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "description": "Unique identifier for the created user"
          }
        }
      },
      "version": "1.0.0",
      "deprecated": false
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalEndpoints": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
\`\`\`

You can omit any filter parameters to get all endpoints for the service.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Endpoint Discovery Endpoint
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

