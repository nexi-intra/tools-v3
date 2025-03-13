import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { applyThrottling } from '@/lib/throttle';

interface EndpointDiscoverRequest {
	nameFilter?: string;
	versionFilter?: string;
	includeDeprecated?: boolean;
	page?: number;
	pageSize?: number;
	token: string;
}

export async function POST(request: NextRequest, { params }: { params: { name: string } }) {
	try {
		// Get the service name from the URL path
		const { name } = params;

		if (!name) {
			return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
		}

		// Clone the request for throttling check
		const requestClone = request.clone();

		// Apply throttling
		const throttleResponse = await applyThrottling(requestClone, name);
		if (throttleResponse) {
			return throttleResponse;
		}

		// Parse the request body
		const body = (await request.json()) as EndpointDiscoverRequest;

		// Extract and validate required properties
		const { nameFilter, versionFilter, includeDeprecated = true, page = 1, pageSize = 10, token } = body;

		// Validate token (implement your authentication logic here)
		if (!token) {
			return NextResponse.json({ error: 'Authentication token is required' }, { status: 401 });
		}

		// Verify API key
		const apiKey = await prisma.servicesApiKey.findFirst({
			where: {
				key: token,
				active: true,
				OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
			},
		});

		if (!apiKey) {
			return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 401 });
		}

		// Check if the service exists
		const service = await prisma.servicesService.findFirst({
			where: {
				name,
				active: true,
			},
		});

		if (!service) {
			return NextResponse.json(
				{ error: 'Service not found or has no discoverable endpoints' },
				{ status: 404 },
			);
		}

		// Build the query
		const where: any = { serviceId: service.id };

		if (!includeDeprecated) {
			where.deprecated = false;
		}

		if (nameFilter) {
			where.OR = [{ name: { contains: nameFilter } }, { description: { contains: nameFilter } }];
		}

		if (versionFilter) {
			where.version = versionFilter;
		}

		// Count total endpoints matching the query
		const totalEndpoints = await prisma.servicesEndpoint.count({ where });

		// Calculate pagination
		const totalPages = Math.ceil(totalEndpoints / pageSize);
		const safetyPage = Math.max(1, Math.min(page, totalPages || 1));
		const skip = (safetyPage - 1) * pageSize;

		// Get paginated endpoints
		const endpoints = await prisma.servicesEndpoint.findMany({
			where,
			include: {
				parameters: true,
				responseSchema: {
					include: {
						properties: true,
					},
				},
			},
			skip,
			take: pageSize,
			orderBy: {
				name: 'asc',
			},
		});

		// Format the response
		const formattedEndpoints = endpoints.map(endpoint => ({
			name: endpoint.name,
			description: endpoint.description,
			parameters: endpoint.parameters.map(param => ({
				name: param.name,
				type: param.type,
				required: param.required,
				description: param.description,
			})),
			responseSchema: endpoint.responseSchema
				? {
						type: endpoint.responseSchema.type,
						properties: endpoint.responseSchema.properties.reduce((acc, prop) => {
							acc[prop.name] = {
								type: prop.type,
								description: prop.description,
								...(prop.format && { format: prop.format }),
							};
							return acc;
						}, {} as Record<string, any>),
				  }
				: null,
			version: endpoint.version,
			deprecated: endpoint.deprecated,
		}));

		// Return the results
		return NextResponse.json({
			service: name,
			endpoints: formattedEndpoints,
			pagination: {
				page: safetyPage,
				pageSize,
				totalEndpoints,
				totalPages,
				hasNextPage: safetyPage < totalPages,
				hasPreviousPage: safetyPage > 1,
			},
		});
	} catch (error) {
		console.error('Error processing endpoint discovery request:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
