'use server';
import { cookies } from 'next/headers';

import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

import {
	createKoksmatIdTokenForPanel,
	createKoksmatToken,
	KOKSMAT_TOKEN_NAME,
	setKoksmatTokenCookie,
} from '@/lib/auth';
import { SupportedLanguage } from '@/contexts/language-context';
import { UserProfile } from '@prisma/client';

export async function actionSignIn(accessToken: string): Promise<string> {
	const token = decodeJwt(accessToken);
	const upn = token.upn ?? token.unique_name;

	let result = '';
	try {
		// const user = await prisma.userProfile.findFirst({
		// 	where: {
		// 		email: upn,
		// 	},
		// 	include: {
		// 		Session: true,
		// 	},
		// });
		// if (!user) {
		// 	throw new Error('User not found');
		// }

		const user = await prisma.userProfile.upsert({
			where: {
				email: upn,
			},
			update: {
				lastLogin: new Date(),
				updated_by: 'system',
			},
			create: {
				email: upn,
				name: upn,
				displayName: token.name,
				created_by: 'system',
				updated_by: 'system',
				lastLogin: new Date(),
			},
		});

		const userId = user.id;
		const newToken = await createKoksmatToken(userId, 1);
		await setKoksmatTokenCookie(newToken);
		result = newToken;
	} catch (e) {
		console.error(e);
		throw new Error('Cannot sign in');
	}
	return result;
}
const languageCookieName = 'language';

export async function sessionSetLanguage(language: SupportedLanguage) {
	(await cookies()).set(languageCookieName, language, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 3600, // 1 hour
		path: '/',
	});
	return [language];
}

export async function sessionGetLanguage() {
	const language = (await cookies()).get(languageCookieName);
	if (!language) {
		return 'en';
	}
	return language.value as SupportedLanguage;
}

export async function sessionGetUser() {
	const token = (await cookies()).get(KOKSMAT_TOKEN_NAME);
	if (!token) {
		return null;
	}
	const decoded = decodeJwt(token.value);

	const newToken = await createKoksmatToken(decoded.userId, 1);
	await setKoksmatTokenCookie(newToken);

	const user = await prisma.userProfile.findFirst({
		where: {
			id: decoded.userId,
		},
		include: {
			roles: true,
		},
	});
	return user;
}

export async function sessionGetIdToken(apiEndPoint: string) {
	const user = await sessionGetUser();
	if (!user) {
		return null;
	}

	const idToken = await createKoksmatIdTokenForPanel(user, user.roles, apiEndPoint);
	return idToken;
}

export async function sessionValidateIdToken(token: string) {
	const decoded = decodeJwt(token);
	if (!decoded) {
		throw new Error('Invalid token');
	}
	const user = await prisma.userProfile.findUnique({
		where: { id: decoded.userId },
	});
	if (!user) {
		throw new Error('User not found');
	}
	return user;
}

export async function sessionValidateKoksmatToken(token: string) {
	const decoded = decodeJwt(token);
	if (!decoded) {
		throw new Error('Invalid token');
	}
	return decoded;
}
