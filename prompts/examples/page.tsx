import UserCreateExample from "./user-create-example"
import PaymentProcessExample from "./payment-process-example"
import NotificationEmailExample from "./notification-email-example"
import ServiceDiscoveryExample from "./service-discovery-example"
import EndpointDiscoveryExample from "./endpoint-discovery-example"

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Example Prompts for v0.dev</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Copy these example prompts to use with v0.dev to create interfaces for the microservice broker.
      </p>

      <div className="grid gap-8">
        <UserCreateExample />
        <PaymentProcessExample />
        <NotificationEmailExample />
        <ServiceDiscoveryExample />
        <EndpointDiscoveryExample />
      </div>
    </div>
  )
}

