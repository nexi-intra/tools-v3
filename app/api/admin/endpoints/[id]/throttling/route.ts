import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if endpoint exists
		const existingEndpoint = await prisma.servicesEndpoint.findUnique({
			where: { id },
		});

		if (!existingEndpoint) {
			return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
		}

		// Validate the throttling settings
		const { throttleEnabled, requestsPerMinute, requestsPerHour, requestsPerDay } = body;

		// Update the endpoint throttling settings
		const endpoint = await prisma.servicesEndpoint.update({
			where: { id },
			data: {
				throttleEnabled: throttleEnabled !== undefined ? throttleEnabled : existingEndpoint.throttleEnabled,
				requestsPerMinute:
					requestsPerMinute !== undefined ? requestsPerMinute : existingEndpoint.requestsPerMinute,
				requestsPerHour: requestsPerHour !== undefined ? requestsPerHour : existingEndpoint.requestsPerHour,
				requestsPerDay: requestsPerDay !== undefined ? requestsPerDay : existingEndpoint.requestsPerDay,
			},
		});

		return NextResponse.json({ endpoint });
	} catch (error) {
		console.error('Error updating endpoint throttling settings:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
