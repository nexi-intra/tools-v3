import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import prisma from '@/prisma';

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
		return 'red';
	}

	if (item.koksmat_masterdata_etag === tag) {
		return 'green';
	}

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

			const { searchParams } = new URL(request.url);
			const color = searchParams.get('color') || 'red';
			const text = searchParams.get('text') || 'SVG';
			const json = JSON.stringify(
				{
					item: {
						name: { ...item, icon: '' },
						image: null,
					},
				},
				null,
				2,
			);
			const svgContent = `
        
           <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
           <!--
           
        ${json}   
           -->
      <rect width="100%" height="100%" fill="black" />
      <text x="50%" y="50%" fill="white" font-size="18" text-anchor="middle" alignment-baseline="middle" font-family="Arial, sans-serif">
        Right click and view source to see the JSON data
      </text>
    </svg>
      `;

			return new NextResponse(svgContent, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'no-cache',
				},
			});
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
