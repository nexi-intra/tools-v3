import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = Number.parseInt(searchParams.get('page') || '1');
		const pageSize = Number.parseInt(searchParams.get('pageSize') || '20');
		const status = searchParams.get('status');
		const service = searchParams.get('service');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		// Build the query
		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (service) {
			where.serviceName = service;
		}

		if (startDate || endDate) {
			where.createdAt = {};

			if (startDate) {
				where.createdAt.gte = new Date(startDate);
			}

			if (endDate) {
				where.createdAt.lte = new Date(endDate);
			}
		}

		// Count total logs matching the query
		const totalLogs = await prisma.servicesRequestLog.count({ where });

		// Calculate pagination
		const totalPages = Math.ceil(totalLogs / pageSize);
		const safetyPage = Math.max(1, Math.min(page, totalPages || 1));
		const skip = (safetyPage - 1) * pageSize;

		// Get paginated logs
		const logs = await prisma.servicesRequestLog.findMany({
			where,
			skip,
			take: pageSize,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({
			logs,
			pagination: {
				page: safetyPage,
				pageSize,
				totalLogs,
				totalPages,
				hasNextPage: safetyPage < totalPages,
				hasPreviousPage: safetyPage > 1,
			},
		});
	} catch (error) {
		console.error('Error fetching logs:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
