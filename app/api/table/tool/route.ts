import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiEndpoints, toolSchema } from '@/lib/api-schema';

export async function GET(request: NextRequest) {
	try {
		// Validate and parse the ID using our Zod schema

		const searchParams = request.nextUrl.searchParams;

		const tools = await prisma.tool.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				icon: true,
			},
		});

		// Validate the response with our schema

		return NextResponse.json(tools);
	} catch (error) {
		console.error('Error fetching tools:', error);
		return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
	}
}
