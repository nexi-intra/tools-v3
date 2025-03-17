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

export async function GET(request: NextRequest, { params }: { params: Promise<{ tool_id: string }> }) {
	// const pathName = request.nextUrl.pathname;
	// const slug = pathName.split('/').filter(Boolean);

	// const [og, tool, tool_id] = slug;
	const { tool_id } = await params;
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
					display: 'flex',
					height: '100%',
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					letterSpacing: '-.02em',
					fontWeight: 700,
					background: "#2D32AA",
				}}
			>
				<div
					style={{
						left: 42,
						top: 42,
						position: 'absolute',
						display: 'flex',
						alignItems: 'center',
					}}
				>

					<span
						style={{
							marginLeft: 8,
							fontSize: 20,
						}}
					>
						<NexiLogo style={{ fontSize: "24px", padding: "20px" }} />
					</span>
				</div>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						padding: '20px 50px',
						margin: '0 42px',
						fontSize: 40,
						width: 'auto',
						maxWidth: 550,
						textAlign: 'center',

						color: 'white',
						lineHeight: 1.4,
					}}
				>
					{/* <img src={ toolItem?.icon!} alt={toolItem?.name} width="100" height="100"  /> */}
					{toolItem?.name}
				</div>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						padding: '20px 50px',
						margin: '0 42px',
						fontSize: 20,
						width: 'auto',
						maxWidth: 550,
						textAlign: 'center',

						color: 'white',
						lineHeight: 1.4,
					}}
				>
					{toolItem?.description}
				</div>
			</div>


		),
		{
			width: 1200,
			height: 600,
		}
	);
}

function NexiLogo(props: any) {
	return (


		<svg
			version="1.1"
			id="Livello_1"
			viewBox="0 0 88.100002 26.602287"

			width="88.099998"
			height="26.602287"
			xmlns="http://www.w3.org/2000/svg"
		><defs
				id="defs19" />


			<g
				id="Symbols"
				transform="translate(-0.2,-3.222222)">
				<g
					id="logo-dark"
					transform="translate(0,-5)">
					<g
						id="logo-double"
						transform="translate(0,5)">
						<g
							id="nexi"
							transform="translate(0,3.222222)">
							<polygon
								id="Fill-36"

								fill='#ffffff'
								points="88.3,0.8 81.9,0.8 81.9,25.9 88.3,25.9 " />
							<path
								id="Fill-37"
								fill='#ffffff'
								d="M 12.5,0.1 C 6.5,0.1 0.2,2.2 0.2,2.2 V 26 H 6.8 V 6.6 c 0,0 2.3,-1 5.8,-1 4.3,0 6,2.3 6,5.9 v 14.4 h 6.5 c 0,-0.4 0,-14 0,-14.4 C 25.1,3.8 21.5,0.1 12.5,0.1" />
							<path
								id="Fill-38"
								fill='#ffffff'
								d="M 80.1,0.8 H 72.2 L 66.2,8.2 63,4 C 61.4,1.9 58.7,0.7 56.1,0.7 h -3.9 l 9.9,12.5 -10.2,12.7 h 7.8 l 6.4,-7.8 3.7,4.6 c 1.6,2.1 4.3,3.2 6.9,3.2 h 3.8 L 70.2,13 Z" />
							<path
								id="Fill-39"
								fill='#ffffff'
								d="m 40.6,5.5 c 2.9,0 5.3,1.3 6.2,3.6 l -13,2.3 C 34.5,7.6 37.2,5.5 40.6,5.5 M 53,21.1 48.7,17.6 c -1.4,1.6 -3.7,3.5 -7.5,3.5 -3,0 -5.7,-1.6 -6.9,-4.4 L 53.6,13.3 C 53.6,11.4 53.2,9.6 52.5,8 50.5,3.3 46,0 40.4,0 33,0 27.3,5.3 27.3,13.3 c 0,7.8 5.6,13.3 13.8,13.3 6.3,0.1 10,-3.1 11.9,-5.5" />
						</g>
					</g>
				</g>
			</g>
		</svg>

	)
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
