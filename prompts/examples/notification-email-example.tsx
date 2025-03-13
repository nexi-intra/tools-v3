import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "../copy-button"

export default function NotificationEmailExample() {
  const prompt = `Create an email notification form that sends emails via the microservice broker.

The form should:
1. Have fields for recipient email, subject, body content, and options for HTML formatting and attachments
2. Include validation for required fields
3. Send a POST request to /api/broker/notification.email with the following payload structure:

\`\`\`json
{
  "token": "your-auth-token",
  "timeout": 30000,
  "async": true,
  "body": {
    "to": "recipient@example.com",
    "subject": "Important Notification",
    "body": "This is the content of the email notification.",
    "isHtml": false,
    "attachments": []
  }
}
\`\`\`

Note that this request uses async: true since email sending typically doesn't need an immediate response.

After submission, display the response which should include:
- A success message
- A request ID for tracking
- Confirmation that the request was sent asynchronously

Show both success and error states.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Email Notification Example
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

