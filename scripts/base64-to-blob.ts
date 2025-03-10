import { ToolsApp } from '@/internal/app-tools';
import { calculateDataUrlHash, convertDataUrlToBuffer } from '@/lib/blob';
import prisma from '@/prisma';

async function main() {
	const app = new ToolsApp();

	const base64Items = await prisma.tool.findMany({
		where: {
			icon: {
				contains: 'data:',
			},
		},
	});
	console.log(base64Items.length);
	for (const item of base64Items) {
		if (item.icon) {
			const image = convertDataUrlToBuffer(item.icon);

			const hash = calculateDataUrlHash(item.icon);

			console.log(item.name);
			let blob = await prisma.blob.upsert({
				where: {
					hash,
				},
				create: {
					data: image,
					content_type: 'image/png',
					hash,
					source_tool_id: item.id,
					base64: item.icon,
					name: item.name,
				},
				update: {
					data: image,
					content_type: 'image/png',
				},
			});

			await prisma.tool.update({
				where: {
					id: item.id,
				},
				data: {
					icon: `/blob/${blob.id}`,
					uploaded_icon: item.icon,
				},
			});
		}
	}

	console.log('done');
}

main();
