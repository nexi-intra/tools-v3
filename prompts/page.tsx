import ServiceDiscoveryPrompt from "./service-discovery-prompt"
import EndpointDiscoveryPrompt from "./endpoint-discovery-prompt"
import ServiceRequestPrompt from "./service-request-prompt"

export default function PromptsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Microservice Broker API Prompts</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Copy these prompts to use with v0.dev or other AI tools to demonstrate how to use the microservice broker API.
      </p>

      <div className="grid gap-8">
        <ServiceDiscoveryPrompt />
        <EndpointDiscoveryPrompt />
        <ServiceRequestPrompt />
      </div>
    </div>
  )
}

