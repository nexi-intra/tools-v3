'use server';
import { ToolsApp } from '@/internal/app-tools';
import { getKoksmatTokenCookie } from '@/lib/auth';
import prisma from '@/prisma';
import { Board, Tool } from '@prisma/client';

export async function actionToolSave(
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
	let toolRecord: Tool;
	try {
		toolRecord = await prisma.tool.update({
			where: {
				id: id,
			},
			data: {
				name: name,

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
		id: toolRecord.id,
	};
}

export async function actionToolSaveCopy(
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
	let toolRecord: Tool;
	try {
		toolRecord = await prisma.tool.create({
			data: {
				name: name,
				created_by: user.name,
				updated_by: user.name,
				url: '',
				category: {
					connectOrCreate: {
						where: { name: 'Personal' },
						create: { name: 'Personal' },
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
		id: toolRecord.id,
	};
}

export async function actionToolUpdate(
	id: number,
	name: string,

	description: string,
	icon: string,
	url: string,
	//tags,
	//countries,
	//purposes,
	//documents,
	//status: isFavorite ? 'active' : 'inactive'
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
	let toolRecord: Tool;
	try {
		toolRecord = await prisma.tool.update({
			where: {
				id: id,
			},
			data: {
				name: name,
				description: description,
				icon: icon,
				url: url,
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
		id: toolRecord.id,
	};
}

export async function actionToolFind() {
	return prisma.tool.findMany();
}

export async function actionToolFindById(id: number) {
	return prisma.tool.findFirst({
		where: {
			id: id,
		},
	});
}
