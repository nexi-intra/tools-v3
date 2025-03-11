'use server';
import { ToolsApp } from '@/internal/app-tools';
import { getKoksmatTokenCookie, parseSessionToken } from '@/lib/auth';
import { decodeJwt } from '@/lib/tokens';
import prisma from '@/prisma';
import { UserProfile } from '@prisma/client';

export async function actionFavouriteConnect(sessionToken: string, toolId: number) {
	let session;
	if (sessionToken) {
		session = await parseSessionToken(sessionToken);
	} else {
		session = await getKoksmatTokenCookie();
	}
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
export async function actionFavouriteDisconnect(sessionToken: string, toolId: number) {
	let session;
	if (sessionToken) {
		session = await parseSessionToken(sessionToken);
	} else {
		session = await getKoksmatTokenCookie();
	}
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

export async function actionUserHomePageSave(
	language: string,
): Promise<{ saved: boolean; error?: string; homePage?: string }> {
	const session = await getKoksmatTokenCookie();
	const app = new ToolsApp();
	const user = await app.user();
	if (!session)
		return {
			saved: false,
			error: 'No session',
		};
	let result = false;
	const homePage = `/pages/${language}/explorer`;

	try {
		await prisma.userProfile.update({
			where: {
				id: user.id,
			},
			data: {
				homePage,
				language,
				updated_by: user.name,
			},
		});
		result = true;
	} catch (err) {
		console.error(err);
		return {
			saved: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
	return {
		saved: true,
		homePage,
	};
}

export async function actionUserHomePageGet(): Promise<{ error?: string; homePage?: string; language?: string }> {
	const session = await getKoksmatTokenCookie();
	const app = new ToolsApp();
	const user = await app.user();
	if (!session)
		return {
			error: 'No session',
		};

	return {
		homePage: user.homePage!,
		language: user.language!,
	};
}
