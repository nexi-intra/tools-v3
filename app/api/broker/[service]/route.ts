import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { applyThrottling } from '@/lib/throttle';

export async function POST(request: NextRequest, { params }: { params: { service: string } }) {
	try {
		// Get the service name from the URL path
		const { service } = params;

		if (!service) {
			return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
		}

		// Clone the request for throttling check
		const requestClone = request.clone();

		// Apply throttling
		const throttleResponse = await applyThrottling(requestClone, service);
		if (throttleResponse) {
			return throttleResponse;
		}

		// Parse the request body
		const body = await request.json();

		// Extract and validate required properties
		const { timeout = 30000, async = false, token, body: payload } = body;

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

		// Check if the service exists
		const serviceRecord = await prisma.servicesService.findFirst({
			where: {
				name: service,
				active: true,
			},
		});

		if (!serviceRecord) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Generate a unique request ID
		const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

		// Get client IP
		const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';

		// For async requests, log and return immediately
		if (async) {
			// Log the request
			await prisma.servicesRequestLog.create({
				data: {
					serviceName: service,
					requestId,
					payload,
					async: true,
					timeout,
					status: 'pending',
					apiKeyId: apiKey.id,
					clientIp: clientIp?.toString(),
				},
			});

			// In a real implementation, you would publish to a message queue here
			// For now, we'll just simulate it with a timeout
			setTimeout(async () => {
				try {
					// Simulate processing
					const processingTime = Math.floor(Math.random() * 1000);
					const success = Math.random() > 0.1; // 90% success rate

					// Update the request log
					await prisma.servicesRequestLog.update({
						where: { requestId },
						data: {
							status: success ? 'success' : 'error',
							processingTime,
							response: success
								? {
										success: true,
										message: 'Request processed successfully',
										timestamp: new Date().toISOString(),
								  }
								: {
										success: false,
										error: 'Failed to process request',
										timestamp: new Date().toISOString(),
								  },
							errorMessage: success ? null : 'Failed to process request',
						},
					});
				} catch (error) {
					console.error('Error processing async request:', error);

					// Update the request log with error
					await prisma.servicesRequestLog.update({
						where: { requestId },
						data: {
							status: 'error',
							errorMessage: error instanceof Error ? error.message : 'Unknown error',
						},
					});
				}
			}, Math.random() * 2000); // Random delay between 0-2000ms

			return NextResponse.json({
				success: true,
				message: 'Request sent asynchronously',
				requestId,
			});
		}

		// For synchronous requests, process immediately
		const startTime = Date.now();

		try {
			// Simulate processing
			const processingTime = Math.floor(Math.random() * 1000);

			// Simulate processing delay
			await new Promise(resolve => setTimeout(resolve, processingTime));

			// Check if timeout occurred
			if (processingTime > timeout) {
				// Log the timeout
				await prisma.servicesRequestLog.create({
					data: {
						serviceName: service,
						requestId,
						payload,
						async: false,
						timeout,
						status: 'timeout',
						processingTime,
						errorMessage: 'Request timed out',
						apiKeyId: apiKey.id,
						clientIp: clientIp?.toString(),
					},
				});

				return NextResponse.json({ error: 'Request timed out' }, { status: 408 });
			}

			// Generate mock response based on service
			let responseData;

			switch (service) {
				case 'user.create':
					responseData = {
						userId: `user_${Date.now()}`,
						created: new Date().toISOString(),
					};
					break;
				case 'user.update':
					responseData = {
						success: true,
						updated: new Date().toISOString(),
					};
					break;
				case 'payment.process':
					responseData = {
						transactionId: `txn_${Date.now()}`,
						status: 'succeeded',
						timestamp: new Date().toISOString(),
					};
					break;
				case 'notification.email':
					responseData = {
						messageId: `msg_${Date.now()}`,
						sent: true,
					};
					break;
				default:
					responseData = {
						success: true,
						message: 'Request processed successfully',
						timestamp: new Date().toISOString(),
					};
			}

			// Calculate total processing time
			const endTime = Date.now();
			const totalProcessingTime = endTime - startTime;

			// Log the successful request
			await prisma.servicesRequestLog.create({
				data: {
					serviceName: service,
					requestId,
					payload,
					async: false,
					timeout,
					status: 'success',
					processingTime: totalProcessingTime,
					response: responseData,
					apiKeyId: apiKey.id,
					clientIp: clientIp?.toString(),
				},
			});

			// Return the response with request metadata
			return NextResponse.json({
				...responseData,
				request: {
					service,
					payload,
					processingTime: `${totalProcessingTime}ms`,
				},
			});
		} catch (error) {
			// Calculate total processing time
			const endTime = Date.now();
			const totalProcessingTime = endTime - startTime;

			// Log the failed request
			await prisma.servicesRequestLog.create({
				data: {
					serviceName: service,
					requestId,
					payload,
					async: false,
					timeout,
					status: 'error',
					processingTime: totalProcessingTime,
					errorMessage: error instanceof Error ? error.message : 'Unknown error',
					apiKeyId: apiKey.id,
					clientIp: clientIp?.toString(),
				},
			});

			console.error('Error processing request:', error);
			return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error processing request:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
