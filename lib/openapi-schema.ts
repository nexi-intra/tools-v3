import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { z } from 'zod';
import { ToolSchema } from '@/prisma/generated/zod';

// Add more endpoints as needed

// Generate the OpenAPI document
export function generateOpenApiDocument() {
	// Create a registry to register your schemas
	const registry = new OpenAPIRegistry();

	// Register the Tool schema
	const TOOL = 'Tool';
	registry.register(TOOL, ToolSchema);

	// Register the error response schema
	const errorResponseSchema = z.object({
		error: z.string(),
	});
	const ERROR_RESPONSE = 'ErrorResponse';
	registry.register(ERROR_RESPONSE, errorResponseSchema);

	// Register the getToolById endpoint
	registry.registerPath({
		method: 'get',
		path: '/api/table/tool/{id}',
		tags: ['Tools'],
		summary: 'Get a tool by ID',
		request: {
			params: z.object({
				id: z.string().describe('The ID of the tool to retrieve'),
			}),
		},
		responses: {
			200: {
				description: 'Tool found successfully',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Tool' },
					},
				},
			},
			400: {
				description: 'Invalid ID format',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ErrorResponse' },
					},
				},
			},
			404: {
				description: 'Tool not found',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ErrorResponse' },
					},
				},
			},
			500: {
				description: 'Server error',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ErrorResponse' },
					},
				},
			},
		},
	});

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		info: {
			title: 'Tool API',
			version: '1.0.0',
			description: 'API for managing tools',
		},
		openapi: '3.0.0',
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Local development server',
			},
			{
				url: 'https://your-production-url.com',
				description: 'Production server',
			},
		],
	});
}
