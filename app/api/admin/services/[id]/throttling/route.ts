import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if service exists
		const existingService = await prisma.servicesService.findUnique({
			where: { id },
		});

		if (!existingService) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Validate the throttling settings
		const { throttleEnabled, requestsPerMinute, requestsPerHour, requestsPerDay } = body;

		// Update the service throttling settings
		const service = await prisma.servicesService.update({
			where: { id },
			data: {
				throttleEnabled: throttleEnabled !== undefined ? throttleEnabled : existingService.throttleEnabled,
				requestsPerMinute:
					requestsPerMinute !== undefined ? requestsPerMinute : existingService.requestsPerMinute,
				requestsPerHour: requestsPerHour !== undefined ? requestsPerHour : existingService.requestsPerHour,
				requestsPerDay: requestsPerDay !== undefined ? requestsPerDay : existingService.requestsPerDay,
			},
		});

		return NextResponse.json({ service });
	} catch (error) {
		console.error('Error updating service throttling settings:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
