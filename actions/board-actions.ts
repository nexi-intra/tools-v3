'use server';
import { ToolsApp } from '@/internal/app-tools';
import { getKoksmatTokenCookie } from '@/lib/auth';
import prisma from '@/prisma';
import { Board } from '@prisma/client';

export async function actionBoardSave(
	id: number,
	name: string,
	json: string,
): Promise<{ saved: boolean; error?: string; id?: number }> {
	const session = await getKoksmatTokenCookie();
	const app = new ToolsApp();
	const user = await app.user();
	if (!session)
		return {
			saved: false,
			error: 'No session',
		};
	let result = false;
	let boardRecord: Board;
	try {
		boardRecord = await prisma.board.update({
			where: {
				id: id,
			},
			data: {
				name: name,

				updated_by: user.name,
				layout: JSON.parse(json),
				managedBy: {
					connect: {
						id: session.userId,
					},
				},
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
		id: boardRecord.id,
	};
}

export async function actionBoardSaveCopy(
	name: string,
	json: string,
): Promise<{ saved: boolean; error?: string; id?: number }> {
	const session = await getKoksmatTokenCookie();
	const app = new ToolsApp();
	const user = await app.user();
	if (!session)
		return {
			saved: false,
			error: 'No session',
		};
	let result = false;
	let boardRecord: Board;
	try {
		boardRecord = await prisma.board.create({
			data: {
				name: name,
				created_by: user.name,
				updated_by: user.name,
				layout: JSON.parse(json),
				managedBy: {
					connect: {
						id: session.userId,
					},
				},
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
		id: boardRecord.id,
	};
}
