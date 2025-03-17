import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		const endpoint = await prisma.servicesEndpoint.findUnique({
			where: { id },
			include: {
				parameters: true,
				responseSchema: {
					include: {
						properties: true,
					},
				},
			},
		});

		if (!endpoint) {
			return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
		}

		return NextResponse.json({ endpoint });
	} catch (error) {
		console.error('Error fetching endpoint:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if endpoint exists
		const existingEndpoint = await prisma.servicesEndpoint.findUnique({
			where: { id },
			include: {
				parameters: true,
				responseSchema: {
					include: {
						properties: true,
					},
				},
			},
		});

		if (!existingEndpoint) {
			return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
		}

		// Update the endpoint in a transaction
		const endpoint = await prisma.$transaction(async tx => {
			// Update basic endpoint info
			const updatedEndpoint = await tx.servicesEndpoint.update({
				where: { id },
				data: {
					name: body.name,
					description: body.description,
					version: body.version,
					deprecated: body.deprecated,
				},
			});

			// Update parameters if provided
			if (body.parameters) {
				// Delete existing parameters
				await tx.servicesParameter.deleteMany({
					where: { endpointId: id },
				});

				// Create new parameters
				await tx.servicesParameter.createMany({
					data: body.parameters.map((param: any) => ({
						name: param.name,
						type: param.type,
						required: param.required || false,
						description: param.description,
						endpointId: id,
					})),
				});
			}

			// Update response schema if provided
			if (body.responseSchema) {
				// Delete existing response schema and properties
				if (existingEndpoint.responseSchema) {
					await tx.servicesSchemaProperty.deleteMany({
						where: { responseSchemaId: existingEndpoint.responseSchema.id },
					});

					await tx.servicesResponseSchema.delete({
						where: { id: existingEndpoint.responseSchema.id },
					});
				}

				// Create new response schema and properties
				await tx.servicesResponseSchema.create({
					data: {
						type: body.responseSchema.type,
						endpointId: id,
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
				});
			}

			// Return the updated endpoint with all relations
			return tx.servicesEndpoint.findUnique({
				where: { id },
				include: {
					parameters: true,
					responseSchema: {
						include: {
							properties: true,
						},
					},
				},
			});
		});

		return NextResponse.json({ endpoint });
	} catch (error) {
		console.error('Error updating endpoint:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		// Check if endpoint exists
		const existingEndpoint = await prisma.servicesEndpoint.findUnique({
			where: { id },
		});

		if (!existingEndpoint) {
			return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
		}

		// Delete the endpoint
		await prisma.servicesEndpoint.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting endpoint:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
