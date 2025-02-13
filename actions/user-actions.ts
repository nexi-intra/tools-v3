'use server';
import { getKoksmatTokenCookie } from '@/lib/auth';
import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

export async function actionFavouriteConnect(toolId: number) {
	const session = await getKoksmatTokenCookie();
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
export async function actionFavouriteDisconnect(toolId: number) {
	const session = await getKoksmatTokenCookie();
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
