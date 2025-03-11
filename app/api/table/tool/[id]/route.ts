import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiEndpoints, toolSchema } from '@/lib/api-schema';
import { getKoksmatTokenCookie } from '@/lib/auth';
import { ToolsApp } from '@/internal/app-tools';
import { parse } from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const session = await getKoksmatTokenCookie();
		const app = new ToolsApp();
		const user = await app.user();
		if (!session) {
			return NextResponse.json({ error: 'No session' }, { status: 401 });
		}

		const tool = await prisma.tool.findFirst({
			where: { id: parseInt(id) },
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
