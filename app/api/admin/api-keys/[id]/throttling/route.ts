import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if API key exists
		const existingApiKey = await prisma.servicesApiKey.findUnique({
			where: { id },
		});

		if (!existingApiKey) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Validate the throttling settings
		const { throttleEnabled, requestsPerMinute, requestsPerHour, requestsPerDay } = body;

		// Update the API key throttling settings
		const apiKey = await prisma.servicesApiKey.update({
			where: { id },
			data: {
				throttleEnabled: throttleEnabled !== undefined ? throttleEnabled : existingApiKey.throttleEnabled,
				requestsPerMinute:
					requestsPerMinute !== undefined ? requestsPerMinute : existingApiKey.requestsPerMinute,
				requestsPerHour: requestsPerHour !== undefined ? requestsPerHour : existingApiKey.requestsPerHour,
				requestsPerDay: requestsPerDay !== undefined ? requestsPerDay : existingApiKey.requestsPerDay,
			},
		});

		return NextResponse.json({ apiKey });
	} catch (error) {
		console.error('Error updating API key throttling settings:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
