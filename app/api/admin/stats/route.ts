import prisma from '@/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		// Get counts
		const [
			totalServices,
			totalEndpoints,
			totalRequests,
			totalSuccessfulRequests,
			totalFailedRequests,
			totalTimeoutRequests,
			totalApiKeys,
			activeApiKeys,
		] = await Promise.all([
			prisma.servicesService.count(),
			prisma.servicesEndpoint.count(),
			prisma.servicesRequestLog.count(),
			prisma.servicesRequestLog.count({ where: { status: 'success' } }),
			prisma.servicesRequestLog.count({ where: { status: 'error' } }),
			prisma.servicesRequestLog.count({ where: { status: 'timeout' } }),
			prisma.servicesApiKey.count(),
			prisma.servicesApiKey.count({ where: { active: true } }),
		]);

		// Get top services by request count
		const topServices = await prisma.servicesRequestLog.groupBy({
			by: ['serviceName'],
			_count: {
				serviceName: true,
			},
			orderBy: {
				_count: {
					serviceName: 'desc',
				},
			},
			take: 5,
		});

		// Get average processing time by service
		const avgProcessingTime = await prisma.servicesRequestLog.groupBy({
			by: ['serviceName'],
			_avg: {
				processingTime: true,
			},
			where: {
				processingTime: { not: null },
			},
			orderBy: {
				_avg: {
					processingTime: 'desc',
				},
			},
			take: 5,
		});

		// Get request count by day for the last 7 days
		const last7Days = new Date();
		last7Days.setDate(last7Days.getDate() - 7);

		const requestsByDay = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM 
        "services_request_log" 
      WHERE 
        created_at >= ${last7Days}
      GROUP BY 
        DATE(created_at) 
      ORDER BY 
        date ASC
    `;

		return NextResponse.json({
			counts: {
				services: totalServices,
				endpoints: totalEndpoints,
				requests: totalRequests,
				successfulRequests: totalSuccessfulRequests,
				failedRequests: totalFailedRequests,
				timeoutRequests: totalTimeoutRequests,
				apiKeys: totalApiKeys,
				activeApiKeys,
			},
			topServices: topServices.map(service => ({
				name: service.serviceName,
				count: service._count.serviceName,
			})),
			avgProcessingTime: avgProcessingTime.map(service => ({
				name: service.serviceName,
				avgTime: service._avg.processingTime,
			})),
			requestsByDay,
		});
	} catch (error) {
		console.error('Error fetching stats:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
