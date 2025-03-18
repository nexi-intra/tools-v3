import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "./copy-button"

export default function ServiceRequestPrompt() {
  const prompt = `Create a POST request to the service endpoint at /api/broker/{service-name} with the following JSON payload:

\`\`\`json
{
  "token": "your-auth-token",
  "timeout": 30000,
  "async": false,
  "body": {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "fullName": "John Doe"
  }
}
\`\`\`

Replace {service-name} with the name of the service you want to call (e.g., "user.create").

This will send a request to the specified microservice with the provided payload. The response will depend on the service being called.

Example response for "user.create":
\`\`\`json
{
  "userId": "12345",
  "created": "2023-06-15T10:30:45.123Z",
  "request": {
    "service": "user.create",
    "payload": {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "securepassword",
      "fullName": "John Doe"
    },
    "processingTime": "123.45ms"
  }
}
\`\`\`

For asynchronous requests (async: true), the response will be immediate:
\`\`\`json
{
  "success": true,
  "message": "Request sent asynchronously",
  "requestId": "req_1234567890"
}
\`\`\`

The "body" field should contain the appropriate payload for the specific service you're calling.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Service Request Endpoint
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

