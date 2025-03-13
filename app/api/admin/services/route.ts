import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest) {
	try {
		const services = await prisma.servicesService.findMany({
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
			orderBy: {
				name: 'asc',
			},
		});

		return NextResponse.json({ services });
	} catch (error) {
		console.error('Error fetching services:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || !body.purpose) {
			return NextResponse.json({ error: 'Name and purpose are required' }, { status: 400 });
		}

		// Check if service already exists
		const existingService = await prisma.servicesService.findUnique({
			where: { name: body.name },
		});

		if (existingService) {
			return NextResponse.json({ error: 'Service with this name already exists' }, { status: 409 });
		}

		// Create the service
		const service = await prisma.servicesService.create({
			data: {
				name: body.name,
				purpose: body.purpose,
				active: body.active !== undefined ? body.active : true,
				tags: body.tags
					? {
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

		return NextResponse.json({ service }, { status: 201 });
	} catch (error) {
		console.error('Error creating service:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
