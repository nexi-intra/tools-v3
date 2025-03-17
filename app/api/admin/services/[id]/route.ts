import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		const service = await prisma.servicesService.findUnique({
			where: { id },
			include: {
				tags: true,
				endpoints: {
					include: {
						parameters: true,
						responseSchema: {
							include: {
								properties: true,
							},
						},
					},
				},
			},
		});

		if (!service) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		return NextResponse.json({ service });
	} catch (error) {
		console.error('Error fetching service:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if service exists
		const existingService = await prisma.servicesService.findUnique({
			where: { id },
			include: { tags: true },
		});

		if (!existingService) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Update the service
		const service = await prisma.servicesService.update({
			where: { id },
			data: {
				name: body.name,
				purpose: body.purpose,
				active: body.active,
				tags: body.tags
					? {
							disconnect: existingService.tags.map(tag => ({ id: tag.id })),
							connectOrCreate: body.tags.map((tag: string) => ({
								where: { name: tag },
								create: { name: tag },
							})),
					  }
					: undefined,
			},
			include: {
				tags: true,
			},
		});

		return NextResponse.json({ service });
	} catch (error) {
		console.error('Error updating service:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		// Check if service exists
		const existingService = await prisma.servicesService.findUnique({
			where: { id },
		});

		if (!existingService) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Delete the service
		await prisma.servicesService.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting service:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
