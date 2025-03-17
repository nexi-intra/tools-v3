import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
	try {
		const apiKeys = await prisma.servicesApiKey.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({ apiKeys });
	} catch (error) {
		console.error('Error fetching API keys:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name) {
			return NextResponse.json({ error: 'Name is required' }, { status: 400 });
		}

		// Generate a random API key
		const key = `msb_${crypto.randomBytes(24).toString('hex')}`;

		// Create the API key
		const apiKey = await prisma.servicesApiKey.create({
			data: {
				key,
				name: body.name,
				description: body.description,
				active: body.active !== undefined ? body.active : true,
				expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
			},
		});

		return NextResponse.json({ apiKey }, { status: 201 });
	} catch (error) {
		console.error('Error creating API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
