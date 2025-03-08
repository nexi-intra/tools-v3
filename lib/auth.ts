import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getKey() {
	const secretKey = process.env.JWT_SECRET_KEY;
	if (!secretKey) {
		throw new Error('JWT_SECRET_KEY is not set');
	}
	return new TextEncoder().encode(secretKey);
}

export async function createKoksmatToken(userId: number, sessionId: number): Promise<string> {
	const jwt = await new SignJWT({ userId, sessionId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(getKey());

	return jwt;
}

export async function validateSessionToken(token: string): Promise<{ userId: number; sessionId: number } | null> {
	try {
		const { payload } = await jwtVerify(token, getKey());
		return { userId: payload.userId as number, sessionId: payload.sessionId as number };
	} catch (error) {
		console.error('Error validating token:', error);
		return null;
	}
}
export const KOKSMAT_TOKEN_NAME = 'koksmatToken';
export async function setKoksmatTokenCookie(token: string) {
	(await cookies()).set(KOKSMAT_TOKEN_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 3600, // 1 hour
		path: '/',
	});
}

export async function getKoksmatTokenCookie(): Promise<{ userId: number; sessionId: number } | null> {
	const token = (await cookies()).get(KOKSMAT_TOKEN_NAME);
	if (!token) {
		return null;
	}
	const tokenData = await validateSessionToken(token.value);
	if (!tokenData) {
		throw new Error('Invalid token');
	}
	return tokenData;
}

export async function parseSessionToken(token: string): Promise<{ userId: number; sessionId: number } | null> {
	const tokenData = await validateSessionToken(token);
	if (!tokenData) {
		throw new Error('Invalid token');
	}
	return tokenData;
}
