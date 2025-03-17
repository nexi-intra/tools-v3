import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		const apiKey = await prisma.servicesApiKey.findUnique({
			where: { id },
		});

		if (!apiKey) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		return NextResponse.json({ apiKey });
	} catch (error) {
		console.error('Error fetching API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Check if API key exists
		const existingApiKey = await prisma.servicesApiKey.findUnique({
			where: { id },
		});

		if (!existingApiKey) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Update the API key
		const apiKey = await prisma.servicesApiKey.update({
			where: { id },
			data: {
				name: body.name,
				description: body.description,
				active: body.active,
				expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
			},
		});

		return NextResponse.json({ apiKey });
	} catch (error) {
		console.error('Error updating API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		// Check if API key exists
		const existingApiKey = await prisma.servicesApiKey.findUnique({
			where: { id },
		});

		if (!existingApiKey) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Delete the API key
		await prisma.servicesApiKey.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
