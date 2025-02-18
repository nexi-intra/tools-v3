'use server';
import { cookies } from 'next/headers';

import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

import { createKoksmatToken, setKoksmatTokenCookie } from '@/lib/auth';
import { SupportedLanguage } from '@/contexts/language-context';

export async function actionSignIn(accessToken: string): Promise<string> {
	const token = decodeJwt(accessToken);
	const upn = token.upn;
	let result = '';
	try {
		const user = await prisma.userProfile.findFirst({
			where: {
				name: upn,
			},
			include: {
				Session: true,
			},
		});
		if (!user) {
			throw new Error('User not found');
		}

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
