import { ToolsApp } from '@/internal/app-tools';
import { calculateDataUrlHash, convertDataUrlToBuffer } from '@/lib/blob';
import prisma from '@/prisma';

async function main() {
	const app = new ToolsApp();

	const blobs = await prisma.blob.findMany({
		include: {
			source_tool: true,
		},
	});

	console.log(blobs.length);
	for (const item of blobs) {
		if (item.source_tool) {
			console.log(item.source_tool.name);
			await prisma.tool.update({
				where: {
					id: item.source_tool.id,
				},
				data: {
					// uploaded_icon: item.base64,
					// icon: item.base64,
				},
			});
		}
	}

	console.log('done');
}

main();
