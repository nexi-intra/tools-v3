import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import prisma from '@/prisma';
import { redirect } from 'next/navigation';
import { ToolsApp } from '@/internal/tools-app';
//export const runtime = "edge";
async function readItem(ref: string, id: string) {
	return await prisma.tool.findFirst({
		where: {
			koksmat_masterdataref: ref,
			koksmat_masterdata_id: id,
		},
	});
}
async function readBadgeStatus(ref: string, id: string, tag: string) {
	const item = await prisma.tool.findFirst({
		where: {
			koksmat_masterdataref: ref,
			koksmat_masterdata_id: id,
		},
	});
	if (!item) {
		return 'gray';
	}

	if (item.koksmat_masterdata_etag === tag) {
		return 'green';
	}
	// In this case we start a sync of the item

	const app = new ToolsApp();

	app.syncSharePointItem(item);

	return 'yellow';
}
export async function GET(request: NextRequest) {
	const pathName = request.nextUrl.pathname;
	const searchParams = request.nextUrl.searchParams;
	const sourceList = searchParams.get('source')!;
	const itemId = searchParams.get('id')!;
	const itemVersion = searchParams.get('version')!;

	const slug = pathName.split('/').filter(Boolean);

	const [root, type, ...rest] = slug;

	switch (type) {
		case 'details':
			const item = await readItem(sourceList, itemId);
			if (!item) {
				return new NextResponse('Not found', { status: 404 });
			}
			redirect('/admin/tool/' + item.id);
			return new NextResponse('Redirected', { status: 200 });

			break;
		case 'sync-status':
			const status = await readBadgeStatus(sourceList, itemId, itemVersion);
			return new ImageResponse(
				React.createElement(
					'div',
					{
						style: {
							fontSize: 128,
							background: status,
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						},
					},
					'',
				),
				{
					width: 64,
					height: 32,
					headers: {
						'Cache-Control': 'public, max-age=30',
					},
				},
			);
			break;

		default:
			return new NextResponse('Not found', { status: 404 });
			break;
	}
}
