import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || !body.description || !body.serviceId || !body.version) {
			return NextResponse.json(
				{ error: 'Name, description, serviceId, and version are required' },
				{ status: 400 },
			);
		}

		// Check if service exists
		const service = await prisma.servicesService.findUnique({
			where: { id: body.serviceId },
		});

		if (!service) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Check if endpoint already exists for this service and version
		const existingEndpoint = await prisma.servicesEndpoint.findFirst({
			where: {
				serviceId: body.serviceId,
				name: body.name,
				version: body.version,
			},
		});

		if (existingEndpoint) {
			return NextResponse.json(
				{ error: 'Endpoint with this name and version already exists for this service' },
				{ status: 409 },
			);
		}

		// Create the endpoint
		const endpoint = await prisma.servicesEndpoint.create({
			data: {
				name: body.name,
				description: body.description,
				version: body.version,
				deprecated: body.deprecated || false,
				serviceId: body.serviceId,
				parameters: body.parameters
					? {
							createMany: {
								data: body.parameters.map((param: any) => ({
									name: param.name,
									type: param.type,
									required: param.required || false,
									description: param.description,
								})),
							},
					  }
					: undefined,
				responseSchema: body.responseSchema
					? {
							create: {
								type: body.responseSchema.type,
								properties: {
									createMany: {
										data: Object.entries(body.responseSchema.properties).map(
											([name, prop]: [string, any]) => ({
												name,
												type: prop.type,
												description: prop.description,
												format: prop.format,
											}),
										),
									},
								},
							},
					  }
					: undefined,
			},
			include: {
				parameters: true,
				responseSchema: {
					include: {
						properties: true,
					},
				},
			},
		});

		return NextResponse.json({ endpoint }, { status: 201 });
	} catch (error) {
		console.error('Error creating endpoint:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
