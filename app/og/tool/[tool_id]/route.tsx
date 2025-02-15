import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import prisma from '@/prisma';

//export const runtime = "edge";
async function readItem(id: number) {
	return await prisma.tool.findFirst({
		where: {
			id
		},
	});
}

export async function GET(request: NextRequest) {
	const pathName = request.nextUrl.pathname;
	const slug = pathName.split('/').filter(Boolean);

	const [og, tool, tool_id] = slug;
	const id = parseInt(tool_id);

	const toolItem = await prisma.tool.findFirst({
		where: {
			id
		},
	});

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 24,
					background: "#eeeeee",
					width: "100%",
					height: "100%",
					display: "flex",
					textAlign: "center",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<ChefHatIcon style={{ fontSize: "24px", position: "absolute", left: 10, top: 10 }} />
				<div style={{ fontSize: "24px", position: "absolute", left: 200, top: 20 }}>{toolItem?.name}</div>
				<div style={{ fontSize: "16px", position: "absolute", left: 200, top: 120 }}>{toolItem?.description}</div>

			</div>
		),
		{
			width: 1200,
			height: 600,
		}
	);
}

function ChefHatIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="148"
			height="148"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
			<path d="M6 17h12" />
		</svg>
	);
}
