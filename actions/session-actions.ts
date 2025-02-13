'use server';
import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

import { createKoksmatToken, setKoksmatTokenCookie } from '@/lib/auth';

export async function actionSignIn(accessToken: string): Promise<string[]> {
	const token = decodeJwt(accessToken);
	const upn = token.upn;
	let result = [];
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
		result = ['signedin'];
	} catch (e) {
		console.error(e);
		throw new Error('Cannot sign in');
	}
	return result;
}
