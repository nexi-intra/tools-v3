import { NextResponse } from 'next/server';
import { generateOpenApiDocument } from '@/lib/openapi-schema';

export async function GET() {
	try {
		const openApiDocument = generateOpenApiDocument();
		return NextResponse.json(openApiDocument);
	} catch (error) {
		console.error('Error generating openapi docs:', error);
		return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
	}
}
