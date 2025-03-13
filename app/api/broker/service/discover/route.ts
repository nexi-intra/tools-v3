import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

interface DiscoverRequest {
	nameFilter?: string;
	purposeFilter?: string;
	tags?: string[];
	page?: number;
	pageSize?: number;
	token: string;
}

export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = (await request.json()) as DiscoverRequest;

		// Extract and validate required properties
		const { nameFilter, purposeFilter, tags, page = 1, pageSize = 10, token } = body;

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

		// Build the query
		const where: any = { active: true };

		if (nameFilter) {
			where.name = { contains: nameFilter };
		}

		if (purposeFilter) {
			where.purpose = { contains: purposeFilter };
		}

		if (tags && tags.length > 0) {
			where.tags = {
				some: {
					name: { in: tags },
				},
			};
		}

		// Count total services matching the query
		const totalServices = await prisma.servicesService.count({ where });

		// Calculate pagination
		const totalPages = Math.ceil(totalServices / pageSize);
		const safetyPage = Math.max(1, Math.min(page, totalPages || 1));
		const skip = (safetyPage - 1) * pageSize;

		// Get paginated services
		const services = await prisma.servicesService.findMany({
			where,
			include: {
				tags: true,
			},
			skip,
			take: pageSize,
			orderBy: {
				name: 'asc',
			},
		});

		// Format the response
		const formattedServices = services.map(service => ({
			name: service.name,
			purpose: service.purpose,
			tags: service.tags.map(tag => tag.name),
		}));

		// Return the results
		return NextResponse.json({
			services: formattedServices,
			pagination: {
				page: safetyPage,
				pageSize,
				totalServices,
				totalPages,
				hasNextPage: safetyPage < totalPages,
				hasPreviousPage: safetyPage > 1,
			},
		});
	} catch (error) {
		console.error('Error processing service discovery request:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
