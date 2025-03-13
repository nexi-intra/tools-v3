import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = params;

		const log = await prisma.servicesRequestLog.findUnique({
			where: { id },
		});

		if (!log) {
			return NextResponse.json({ error: 'Log not found' }, { status: 404 });
		}

		return NextResponse.json({ log });
	} catch (error) {
		console.error('Error fetching log:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
