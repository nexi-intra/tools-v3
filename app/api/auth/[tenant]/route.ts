import { sessionValidateIdToken } from '@/actions/session-actions';
import { createAccessToken, createKoksmatToken } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
	const { tenant } = await params;

	const body = await request.json();
	if (!tenant) {
		return NextResponse.json({ error: 'Tenant name is required' }, { status: 400 });
	}
	if (!body.idtoken) {
		return NextResponse.json({ error: 'idtoken is required' }, { status: 400 });
	}

	try {
		const idtoken = body.idtoken;
		const user = await sessionValidateIdToken(idtoken);

		const accessToken = await createAccessToken(user.id, user.displayName ?? user.email, user.email, user.roles);
		await prisma.auditLog.create({
			data: {
				actor: user.email,
				name: 'createAccessToken',
				status: 'success',
				entity: 'user',
				entityid: user.id.toString(),
				action: 'createAccessToken',
				metadata: JSON.stringify({ roles: user.roles }),
			},
		});
		return NextResponse.json({ accessToken }, { status: 200 });
	} catch (error) {
		console.error('Error validating idtoken:', error);
		await prisma.auditLog.create({
			data: {
				actor: 'system',
				name: 'createAccessToken',
				status: 'error',
				entity: 'user',
				entityid: '',
				action: 'createAccessToken',
				metadata: JSON.stringify(error instanceof Error ? error.message : String(error)),
			},
		});

		return NextResponse.json({ error: 'Invalid idtoken' }, { status: 401 });
	}
}
