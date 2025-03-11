import { ToolsApp } from '@/internal/app-tools';
import { calculateDataUrlHash, convertDataUrlToBuffer } from '@/lib/blob';
import prisma from '@/prisma';

async function main() {
	const app = new ToolsApp();

	const blobItems = await prisma.tool.findMany({
		where: {
			icon: {
				contains: '/blob/',
			},
		},
	});
	console.log(blobItems.length);
	for (const item of blobItems) {
		if (item.icon) {
			const blobId = item.icon.split('/').slice(-1);
			const blob = await prisma.blob.findUnique({
				where: {
					id: parseInt(blobId[0]),
				},
			});
			if (!blob) {
				console.log('Blob not found for', item.id, item.name);
				continue;
			}
		}
	}
	console.log('done');
}

main();
