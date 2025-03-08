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

	for (const item of base64Items) {
		if (item.icon) {
			const image = convertDataUrlToBuffer(item.icon);

			const hash = calculateDataUrlHash(item.icon);
			let existingBlob = await prisma.blob.findUnique({
				where: {
					hash,
				},
				select: {
					id: true,
				},
			});
			if (existingBlob) {
				continue;
			}
			console.log(item.name);
			let blob = await prisma.blob.create({
				data: {
					name: item.name,
					base64: item.icon,
					content_type: 'image/png',
					data: image,
					hash,
					source_tool_id: item.id,
				},
			});

			await prisma.tool.update({
				where: {
					id: item.id,
				},
				data: {
					icon: `/blob/${blob.id}`,
				},
			});
		}
	}
	console.log(base64Items.length);
	console.log('done');
}

main();
