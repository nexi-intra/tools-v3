import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clean up existing data
  await prisma.servicesSchemaProperty.deleteMany({})
  await prisma.servicesResponseSchema.deleteMany({})
  await prisma.servicesParameter.deleteMany({})
  await prisma.servicesEndpoint.deleteMany({})
  await prisma.servicesService.deleteMany({})
  await prisma.servicesTag.deleteMany({})
  await prisma.servicesApiKey.deleteMany({})

  // Create tags
  const tags = await Promise.all([
    prisma.servicesTag.create({ data: { name: "user" } }),
    prisma.servicesTag.create({ data: { name: "auth" } }),
    prisma.servicesTag.create({ data: { name: "admin" } }),
    prisma.servicesTag.create({ data: { name: "payment" } }),
    prisma.servicesTag.create({ data: { name: "transaction" } }),
    prisma.servicesTag.create({ data: { name: "notification" } }),
    prisma.servicesTag.create({ data: { name: "product" } }),
    prisma.servicesTag.create({ data: { name: "catalog" } }),
    prisma.servicesTag.create({ data: { name: "order" } }),
    prisma.servicesTag.create({ data: { name: "analytics" } }),
  ])

  // Create API key
  const apiKey = await prisma.servicesApiKey.create({
    data: {
      key: "test-api-key-" + Math.random().toString(36).substring(2, 15),
      name: "Test API Key",
      description: "API key for testing purposes",
      active: true,
    },
  })

  console.log("Created API key:", apiKey.key)

  // Create user.create service
  const userCreateService = await prisma.servicesService.create({
    data: {
      name: "user.create",
      purpose: "Creates a new user account",
      tags: {
        connect: [{ id: tags.find((t) => t.name === "user")!.id }, { id: tags.find((t) => t.name === "auth")!.id }],
      },
    },
  })

  // Create createUser endpoint
  const createUserEndpoint = await prisma.servicesEndpoint.create({
    data: {
      name: "createUser",
      description: "Creates a new user in the system",
      version: "1.0.0",
      deprecated: false,
      serviceId: userCreateService.id,
    },
  })

  // Create parameters for createUser endpoint
  await Promise.all([
    prisma.servicesParameter.create({
      data: {
        name: "username",
        type: "string",
        required: true,
        description: "Unique username for the user",
        endpointId: createUserEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "email",
        type: "string",
        required: true,
        description: "Email address of the user",
        endpointId: createUserEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "password",
        type: "string",
        required: true,
        description: "Password for the user account",
        endpointId: createUserEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "fullName",
        type: "string",
        required: false,
        description: "Full name of the user",
        endpointId: createUserEndpoint.id,
      },
    }),
  ])

  // Create response schema for createUser endpoint
  const createUserResponseSchema = await prisma.servicesResponseSchema.create({
    data: {
      type: "object",
      endpointId: createUserEndpoint.id,
    },
  })

  // Create schema properties for createUser response schema
  await Promise.all([
    prisma.servicesSchemaProperty.create({
      data: {
        name: "userId",
        type: "string",
        description: "Unique identifier for the created user",
        responseSchemaId: createUserResponseSchema.id,
      },
    }),
    prisma.servicesSchemaProperty.create({
      data: {
        name: "created",
        type: "string",
        format: "date-time",
        description: "Timestamp when the user was created",
        responseSchemaId: createUserResponseSchema.id,
      },
    }),
  ])

  // Create user.update service
  const userUpdateService = await prisma.servicesService.create({
    data: {
      name: "user.update",
      purpose: "Updates user information",
      tags: {
        connect: [{ id: tags.find((t) => t.name === "user")!.id }],
      },
    },
  })

  // Create updateUserProfile endpoint
  const updateUserProfileEndpoint = await prisma.servicesEndpoint.create({
    data: {
      name: "updateUserProfile",
      description: "Updates a user's profile information",
      version: "1.0.0",
      deprecated: false,
      serviceId: userUpdateService.id,
    },
  })

  // Create parameters for updateUserProfile endpoint
  await Promise.all([
    prisma.servicesParameter.create({
      data: {
        name: "userId",
        type: "string",
        required: true,
        description: "ID of the user to update",
        endpointId: updateUserProfileEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "fullName",
        type: "string",
        required: false,
        description: "New full name for the user",
        endpointId: updateUserProfileEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "email",
        type: "string",
        required: false,
        description: "New email address for the user",
        endpointId: updateUserProfileEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "preferences",
        type: "object",
        required: false,
        description: "User preferences object",
        endpointId: updateUserProfileEndpoint.id,
      },
    }),
  ])

  // Create response schema for updateUserProfile endpoint
  const updateUserProfileResponseSchema = await prisma.servicesResponseSchema.create({
    data: {
      type: "object",
      endpointId: updateUserProfileEndpoint.id,
    },
  })

  // Create schema properties for updateUserProfile response schema
  await Promise.all([
    prisma.servicesSchemaProperty.create({
      data: {
        name: "success",
        type: "boolean",
        description: "Whether the update was successful",
        responseSchemaId: updateUserProfileResponseSchema.id,
      },
    }),
    prisma.servicesSchemaProperty.create({
      data: {
        name: "updated",
        type: "string",
        format: "date-time",
        description: "Timestamp when the user was updated",
        responseSchemaId: updateUserProfileResponseSchema.id,
      },
    }),
  ])

  // Create payment.process service
  const paymentProcessService = await prisma.servicesService.create({
    data: {
      name: "payment.process",
      purpose: "Processes a payment transaction",
      tags: {
        connect: [
          { id: tags.find((t) => t.name === "payment")!.id },
          { id: tags.find((t) => t.name === "transaction")!.id },
        ],
      },
    },
  })

  // Create processPayment endpoint
  const processPaymentEndpoint = await prisma.servicesEndpoint.create({
    data: {
      name: "processPayment",
      description: "Processes a payment transaction",
      version: "1.0.0",
      deprecated: false,
      serviceId: paymentProcessService.id,
    },
  })

  // Create parameters for processPayment endpoint
  await Promise.all([
    prisma.servicesParameter.create({
      data: {
        name: "amount",
        type: "number",
        required: true,
        description: "Amount to charge",
        endpointId: processPaymentEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "currency",
        type: "string",
        required: true,
        description: "Currency code (e.g., USD, EUR)",
        endpointId: processPaymentEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "paymentMethod",
        type: "object",
        required: true,
        description: "Payment method details",
        endpointId: processPaymentEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "description",
        type: "string",
        required: false,
        description: "Description of the payment",
        endpointId: processPaymentEndpoint.id,
      },
    }),
  ])

  // Create response schema for processPayment endpoint
  const processPaymentResponseSchema = await prisma.servicesResponseSchema.create({
    data: {
      type: "object",
      endpointId: processPaymentEndpoint.id,
    },
  })

  // Create schema properties for processPayment response schema
  await Promise.all([
    prisma.servicesSchemaProperty.create({
      data: {
        name: "transactionId",
        type: "string",
        description: "Unique identifier for the transaction",
        responseSchemaId: processPaymentResponseSchema.id,
      },
    }),
    prisma.servicesSchemaProperty.create({
      data: {
        name: "status",
        type: "string",
        description: "Status of the transaction (succeeded, pending, failed)",
        responseSchemaId: processPaymentResponseSchema.id,
      },
    }),
    prisma.servicesSchemaProperty.create({
      data: {
        name: "timestamp",
        type: "string",
        format: "date-time",
        description: "Timestamp of the transaction",
        responseSchemaId: processPaymentResponseSchema.id,
      },
    }),
  ])

  // Create notification.email service
  const notificationEmailService = await prisma.servicesService.create({
    data: {
      name: "notification.email",
      purpose: "Sends email notifications",
      tags: {
        connect: [{ id: tags.find((t) => t.name === "notification")!.id }],
      },
    },
  })

  // Create sendEmail endpoint
  const sendEmailEndpoint = await prisma.servicesEndpoint.create({
    data: {
      name: "sendEmail",
      description: "Sends an email notification",
      version: "1.0.0",
      deprecated: false,
      serviceId: notificationEmailService.id,
    },
  })

  // Create parameters for sendEmail endpoint
  await Promise.all([
    prisma.servicesParameter.create({
      data: {
        name: "to",
        type: "string",
        required: true,
        description: "Recipient email address",
        endpointId: sendEmailEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "subject",
        type: "string",
        required: true,
        description: "Email subject line",
        endpointId: sendEmailEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "body",
        type: "string",
        required: true,
        description: "Email body content",
        endpointId: sendEmailEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "isHtml",
        type: "boolean",
        required: false,
        description: "Whether the body contains HTML",
        endpointId: sendEmailEndpoint.id,
      },
    }),
    prisma.servicesParameter.create({
      data: {
        name: "attachments",
        type: "array",
        required: false,
        description: "Array of attachment objects",
        endpointId: sendEmailEndpoint.id,
      },
    }),
  ])

  // Create response schema for sendEmail endpoint
  const sendEmailResponseSchema = await prisma.servicesResponseSchema.create({
    data: {
      type: "object",
      endpointId: sendEmailEndpoint.id,
    },
  })

  // Create schema properties for sendEmail response schema
  await Promise.all([
    prisma.servicesSchemaProperty.create({
      data: {
        name: "messageId",
        type: "string",
        description: "Unique identifier for the email message",
        responseSchemaId: sendEmailResponseSchema.id,
      },
    }),
    prisma.servicesSchemaProperty.create({
      data: {
        name: "sent",
        type: "boolean",
        description: "Whether the email was sent successfully",
        responseSchemaId: sendEmailResponseSchema.id,
      },
    }),
  ])

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

