'use server';
import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';

export async function favouriteConnect(accessToken: string, toolId: number) {
	const token = decodeJwt(accessToken);
	const upn = token.upn;
	let result = false;
	try {
		await prisma.userProfile.update({
			where: {
				name: upn,
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
export async function favouriteDisconnect(accessToken: string, toolId: number) {
	const token = decodeJwt(accessToken);
	const upn = token.upn;
	let result = false;
	try {
		await prisma.userProfile.update({
			where: {
				name: upn,
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
