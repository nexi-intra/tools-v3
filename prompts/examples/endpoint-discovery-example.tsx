import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "../copy-button"

export default function EndpointDiscoveryExample() {
  const prompt = `Create an endpoint discovery interface for exploring available endpoints of a specific microservice.

The interface should:
1. Have a dropdown to select a service
2. Have a search field for filtering endpoints by name or description
3. Have a version filter input
4. Include a toggle for including/excluding deprecated endpoints
5. Include pagination controls
6. Send a POST request to /api/broker/service/{selected-service}/discover with the following payload structure:

\`\`\`json
{
  "token": "your-auth-token",
  "nameFilter": "[entered name filter]",
  "versionFilter": "[entered version]",
  "includeDeprecated": true,
  "page": 1,
  "pageSize": 5
}
\`\`\`

Display the results in an expandable/collapsible list showing:
- Endpoint name
- Version badge
- Deprecated status (if applicable)
- When expanded:
  - Full description
  - Parameters table with name, type, required status, and description
  - Response schema
  - A button to generate a sample request

Include a loading state and error handling.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Endpoint Discovery Interface Example
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

