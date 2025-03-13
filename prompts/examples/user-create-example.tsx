import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "../copy-button"

export default function UserCreateExample() {
  const prompt = `Create a form that sends a POST request to create a new user via the microservice broker.

The form should:
1. Have fields for username, email, password, and full name
2. Include validation for required fields
3. Send a POST request to /api/broker/user.create with the following payload structure:

\`\`\`json
{
  "token": "your-auth-token",
  "timeout": 30000,
  "async": false,
  "body": {
    "username": "[entered username]",
    "email": "[entered email]",
    "password": "[entered password]",
    "fullName": "[entered full name]"
  }
}
\`\`\`

After submission, display the response which should include:
- A userId
- A creation timestamp
- Request details including processing time

Show both success and error states.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          User Creation Example
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

