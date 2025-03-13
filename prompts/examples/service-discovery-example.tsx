import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "../copy-button"

export default function ServiceDiscoveryExample() {
  const prompt = `Create a service discovery interface that allows users to search and filter available microservices.

The interface should:
1. Have a search field for filtering by service name
2. Have a search field for filtering by purpose
3. Include tag filtering with selectable tag options
4. Include pagination controls
5. Send a POST request to /api/broker/service/discover with the following payload structure:

\`\`\`json
{
  "token": "your-auth-token",
  "nameFilter": "[entered name filter]",
  "purposeFilter": "[entered purpose filter]",
  "tags": ["selected", "tags", "array"],
  "page": 1,
  "pageSize": 10
}
\`\`\`

Display the results in a clean, card-based layout showing:
- Service name
- Purpose description
- Associated tags
- Pagination information

Include a loading state and error handling.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Service Discovery Interface Example
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

