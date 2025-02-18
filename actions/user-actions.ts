'use server';
import { getKoksmatTokenCookie, parseSessionToken } from '@/lib/auth';
import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

export async function actionFavouriteConnect(sessionToken: string, toolId: number) {
	const session = await parseSessionToken(sessionToken);
	if (!session) return;
	let result = false;
	try {
		await prisma.userProfile.update({
			where: {
				id: session.userId,
			},
			data: {
				tools: {
					connect: {
						id: toolId,
					},
				},
			},
		});
		result = true;
	} catch (e) {
		console.error(e);
	}
	return result;
}
export async function actionFavouriteDisconnect(koksmatToken: string, toolId: number) {
	const session = await parseSessionToken(koksmatToken);
	if (!session) return;
	let result = false;
	try {
		await prisma.userProfile.update({
			where: {
				id: session.userId,
			},
			data: {
				tools: {
					disconnect: {
						id: toolId,
					},
				},
			},
		});
		result = true;
	} catch (e) {
		console.error(e);
	}
	return result;
}
