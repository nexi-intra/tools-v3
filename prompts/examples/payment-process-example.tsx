import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "../copy-button"

export default function PaymentProcessExample() {
  const prompt = `Create a payment form that processes transactions via the microservice broker.

The form should:
1. Have fields for amount, currency, payment method details (card number, expiry, CVV), and an optional description
2. Include validation for all required fields
3. Send a POST request to /api/broker/payment.process with the following payload structure:

\`\`\`json
{
  "token": "your-auth-token",
  "timeout": 30000,
  "async": false,
  "body": {
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": {
      "type": "card",
      "cardNumber": "4111111111111111",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cvv": "123"
    },
    "description": "Payment for premium subscription"
  }
}
\`\`\`

After submission, display the response which should include:
- A transaction ID
- The transaction status (succeeded, pending, failed)
- A timestamp
- Request details

Show a loading state during processing, and both success and error states after completion.`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Payment Processing Example
          <CopyButton text={prompt} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">{prompt}</pre>
      </CardContent>
    </Card>
  )
}

