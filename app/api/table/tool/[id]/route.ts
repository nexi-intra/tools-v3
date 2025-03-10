import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiEndpoints, toolSchema } from '@/lib/api-schema';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Validate and parse the ID using our Zod schema
		const { id } = apiEndpoints.getToolById.params.parse(params);

		const tool = await prisma.tool.findFirst({
			where: { id },
		});

		if (!tool) {
			return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
		}

		// Validate the response with our schema
		const validatedTool = toolSchema.parse(tool);
		return NextResponse.json(validatedTool);
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'ZodError') {
				return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
			}
		}

		console.error('Error fetching tool:', error);
		return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
	}
}
