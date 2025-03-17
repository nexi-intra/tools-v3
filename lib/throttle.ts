import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { ServicesEndpoint } from '@prisma/client';

interface ThrottleOptions {
	apiKey: string;
	serviceName: string;
	endpointName?: string;
	clientIp?: string;
}

export async function checkThrottleLimit(options: ThrottleOptions): Promise<{
	allowed: boolean;
	limit?: number;
	remaining?: number;
	resetAt?: Date;
	limitType?: 'minute' | 'hour' | 'day';
}> {
	const { apiKey, serviceName, endpointName, clientIp } = options;

	try {
		// Get the API key record
		const apiKeyRecord = await prisma.servicesApiKey.findFirst({
			where: {
				key: apiKey,
				active: true,
			},
		});

		if (!apiKeyRecord) {
			return { allowed: false };
		}

		// Get the service record
		const service = await prisma.servicesService.findFirst({
			where: {
				name: serviceName,
				active: true,
			},
		});

		if (!service) {
			return { allowed: false };
		}

		// Get the endpoint record if applicable
		let endpoint: null | undefined | ServicesEndpoint = null;
		if (endpointName) {
			endpoint = await prisma.servicesEndpoint.findFirst({
				where: {
					serviceId: service.id,
					name: endpointName,
					deprecated: false,
				},
			});
		}

		// Check if throttling is enabled at any level
		const apiKeyThrottleEnabled = apiKeyRecord.throttleEnabled;
		const serviceThrottleEnabled = service.throttleEnabled;
		const endpointThrottleEnabled = endpoint?.throttleEnabled || false;

		if (!apiKeyThrottleEnabled && !serviceThrottleEnabled && !endpointThrottleEnabled) {
			return { allowed: true };
		}

		// Get the current time
		const now = new Date();

		// Create truncated dates for different time periods
		const currentMinute = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
		);

		const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

		const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		// Determine which limits to check (endpoint overrides service, API key can have its own limits)
		// Per-minute limits
		let minuteLimit: number | null = null;
		if (apiKeyThrottleEnabled && apiKeyRecord.requestsPerMinute !== null) {
			minuteLimit = apiKeyRecord.requestsPerMinute;
		} else if (endpointThrottleEnabled && endpoint && endpoint.requestsPerMinute !== null) {
			minuteLimit = endpoint.requestsPerMinute;
		} else if (serviceThrottleEnabled && service.requestsPerMinute !== null) {
			minuteLimit = service.requestsPerMinute;
		}

		// Per-hour limits
		let hourLimit: number | null = null;
		if (apiKeyThrottleEnabled && apiKeyRecord.requestsPerHour !== null) {
			hourLimit = apiKeyRecord.requestsPerHour;
		} else if (endpointThrottleEnabled && endpoint && endpoint.requestsPerHour !== null) {
			hourLimit = endpoint.requestsPerHour;
		} else if (serviceThrottleEnabled && service.requestsPerHour !== null) {
			hourLimit = service.requestsPerHour;
		}

		// Per-day limits
		let dayLimit: number | null = null;
		if (apiKeyThrottleEnabled && apiKeyRecord.requestsPerDay !== null) {
			dayLimit = apiKeyRecord.requestsPerDay;
		} else if (endpointThrottleEnabled && endpoint && endpoint.requestsPerDay !== null) {
			dayLimit = endpoint.requestsPerDay;
		} else if (serviceThrottleEnabled && service.requestsPerDay !== null) {
			dayLimit = service.requestsPerDay;
		}

		// If no limits are set, allow the request
		if (minuteLimit === null && hourLimit === null && dayLimit === null) {
			return { allowed: true };
		}

		// Check and update usage records
		let minuteUsage = 0;
		let hourUsage = 0;
		let dayUsage = 0;

		// Function to get or create a usage record
		async function getOrCreateUsageRecord(period: 'minute' | 'hour' | 'day', date: Date) {
			const where: any = {
				[period]: date,
			};

			// Set the appropriate ID based on priority (endpoint > service > API key > IP)
			if (endpoint) {
				where.endpointId = endpoint.id;
			} else if (service) {
				where.serviceId = service.id;
			} else if (apiKeyRecord) {
				where.apiKeyId = apiKeyRecord.id;
			} else if (clientIp) {
				where.clientIp = clientIp;
			}

			const record = await prisma.servicesUsageRecord.findFirst({
				where,
			});

			if (record) {
				return record;
			}

			// Create a new record if none exists
			return prisma.servicesUsageRecord.create({
				data: {
					[period]: date,
					count: 0,
					...(endpoint ? { endpointId: endpoint.id } : {}),
					...(service ? { serviceId: service.id } : {}),
					...(apiKeyRecord ? { apiKeyId: apiKeyRecord.id } : {}),
					...(clientIp ? { clientIp } : {}),
				},
			});
		}

		// Check minute limit if set
		if (minuteLimit !== null) {
			const minuteRecord = await getOrCreateUsageRecord('minute', currentMinute);
			minuteUsage = minuteRecord.count;

			if (minuteUsage >= minuteLimit) {
				// Calculate reset time (next minute)
				const resetTime = new Date(currentMinute);
				resetTime.setMinutes(resetTime.getMinutes() + 1);

				return {
					allowed: false,
					limit: minuteLimit,
					remaining: 0,
					resetAt: resetTime,
					limitType: 'minute',
				};
			}
		}

		// Check hour limit if set
		if (hourLimit !== null) {
			const hourRecord = await getOrCreateUsageRecord('hour', currentHour);
			hourUsage = hourRecord.count;

			if (hourUsage >= hourLimit) {
				// Calculate reset time (next hour)
				const resetTime = new Date(currentHour);
				resetTime.setHours(resetTime.getHours() + 1);

				return {
					allowed: false,
					limit: hourLimit,
					remaining: 0,
					resetAt: resetTime,
					limitType: 'hour',
				};
			}
		}

		// Check day limit if set
		if (dayLimit !== null) {
			const dayRecord = await getOrCreateUsageRecord('day', currentDay);
			dayUsage = dayRecord.count;

			if (dayUsage >= dayLimit) {
				// Calculate reset time (next day)
				const resetTime = new Date(currentDay);
				resetTime.setDate(resetTime.getDate() + 1);

				return {
					allowed: false,
					limit: dayLimit,
					remaining: 0,
					resetAt: resetTime,
					limitType: 'day',
				};
			}
		}

		// If we get here, the request is allowed
		// Increment usage counters
		if (minuteLimit !== null) {
			await prisma.servicesUsageRecord.updateMany({
				where: {
					minute: currentMinute,
					...(endpoint ? { endpointId: endpoint.id } : {}),
					...(service && !endpoint ? { serviceId: service.id } : {}),
					...(apiKeyRecord && !endpoint && !service ? { apiKeyId: apiKeyRecord.id } : {}),
					...(clientIp && !endpoint && !service && !apiKeyRecord ? { clientIp } : {}),
				},
				data: {
					count: { increment: 1 },
					updatedAt: now,
				},
			});
		}

		if (hourLimit !== null) {
			await prisma.servicesUsageRecord.updateMany({
				where: {
					hour: currentHour,
					...(endpoint ? { endpointId: endpoint.id } : {}),
					...(service && !endpoint ? { serviceId: service.id } : {}),
					...(apiKeyRecord && !endpoint && !service ? { apiKeyId: apiKeyRecord.id } : {}),
					...(clientIp && !endpoint && !service && !apiKeyRecord ? { clientIp } : {}),
				},
				data: {
					count: { increment: 1 },
					updatedAt: now,
				},
			});
		}

		if (dayLimit !== null) {
			await prisma.servicesUsageRecord.updateMany({
				where: {
					day: currentDay,
					...(endpoint ? { endpointId: endpoint.id } : {}),
					...(service && !endpoint ? { serviceId: service.id } : {}),
					...(apiKeyRecord && !endpoint && !service ? { apiKeyId: apiKeyRecord.id } : {}),
					...(clientIp && !endpoint && !service && !apiKeyRecord ? { clientIp } : {}),
				},
				data: {
					count: { increment: 1 },
					updatedAt: now,
				},
			});
		}

		// Determine the most restrictive limit for the response
		let effectiveLimit: number | null = null;
		let effectiveRemaining: number | null = null;
		let effectiveResetAt: Date | null = null;
		let effectiveLimitType: 'minute' | 'hour' | 'day' | null = null;

		if (minuteLimit !== null) {
			effectiveLimit = minuteLimit;
			effectiveRemaining = minuteLimit - minuteUsage - 1; // -1 because we're counting the current request
			effectiveResetAt = new Date(currentMinute);
			effectiveResetAt.setMinutes(effectiveResetAt.getMinutes() + 1);
			effectiveLimitType = 'minute';
		}

		if (hourLimit !== null && (effectiveLimit === null || hourLimit - hourUsage < effectiveRemaining!)) {
			effectiveLimit = hourLimit;
			effectiveRemaining = hourLimit - hourUsage - 1;
			effectiveResetAt = new Date(currentHour);
			effectiveResetAt.setHours(effectiveResetAt.getHours() + 1);
			effectiveLimitType = 'hour';
		}

		if (dayLimit !== null && (effectiveLimit === null || dayLimit - dayUsage < effectiveRemaining!)) {
			effectiveLimit = dayLimit;
			effectiveRemaining = dayLimit - dayUsage - 1;
			effectiveResetAt = new Date(currentDay);
			effectiveResetAt.setDate(effectiveResetAt.getDate() + 1);
			effectiveLimitType = 'day';
		}

		return {
			allowed: true,
			limit: effectiveLimit || undefined,
			remaining: effectiveRemaining !== null ? Math.max(0, effectiveRemaining) : undefined,
			resetAt: effectiveResetAt || undefined,
			limitType: effectiveLimitType || undefined,
		};
	} catch (error) {
		console.error('Error checking throttle limit:', error);
		// In case of error, allow the request to proceed
		return { allowed: true };
	}
}

export async function applyThrottling(
	request: Request,
	serviceName: string,
	endpointName?: string,
	ip?: string,
): Promise<NextResponse | null> {
	try {
		// Extract API key from request
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return NextResponse.json({ error: 'Authentication token is required' }, { status: 401 });
		}

		// Get client IP
		const clientIp = request.headers.get('x-forwarded-for') || ip || 'unknown';

		// Check throttle limits
		const throttleResult = await checkThrottleLimit({
			apiKey: token,
			serviceName,
			endpointName,
			clientIp: clientIp.toString(),
		});

		if (!throttleResult.allowed) {
			const headers = new Headers();

			if (throttleResult.limit) {
				headers.set('X-RateLimit-Limit', throttleResult.limit.toString());
			}

			if (throttleResult.remaining !== undefined) {
				headers.set('X-RateLimit-Remaining', throttleResult.remaining.toString());
			}

			if (throttleResult.resetAt) {
				headers.set('X-RateLimit-Reset', Math.floor(throttleResult.resetAt.getTime() / 1000).toString());
			}

			return NextResponse.json(
				{
					error: `Rate limit exceeded. Try again ${
						throttleResult.resetAt ? `after ${throttleResult.resetAt.toISOString()}` : 'later'
					}`,
					limitType: throttleResult.limitType,
					limit: throttleResult.limit,
					resetAt: throttleResult.resetAt?.toISOString(),
				},
				{
					status: 429,
					headers,
				},
			);
		}

		// If throttling passes, return null to continue with the request
		return null;
	} catch (error) {
		console.error('Error applying throttling:', error);
		// In case of error, allow the request to proceed
		return null;
	}
}
