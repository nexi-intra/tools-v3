import { ToolsApp } from '@/internal/tools-app';
import { ToolSpokeSite } from '@/internal/toolspokesite';
import { spfi } from '@pnp/sp';
import { IAttachmentInfo } from '@pnp/sp/attachments';
import { IItem } from '@pnp/sp/items/types';
import '@pnp/sp/webs';
import '@pnp/sp/lists/web';
import '@pnp/sp/items';
import '@pnp/sp/attachments';
import { write } from 'fs';
async function main() {
	const app = new ToolsApp();

	await app.syncronizeAll({ force: true });
	//await app.syncUserProfiles({ createOnly: true, force: false });

	// const spokeSite = new ToolSpokeSite(
	// 	app,
	// 	'https://christianiabpos.sharepoint.com/sites/nexiintra-home/Lists/All%20Tools/AllItems.aspx',
	// );
	// // const item = await spokeSite.getToolItem('V1', '1');
	// // const result = await app.syncItem(item, await spokeSite.masterdataKey(), { force: true });
	// // console.log(result, item);

	// const pnp = await spokeSite.getPnpConnections();
	// const item = await pnp.sp.web.lists.getByTitle('All Tools').items.getById(1);
	// const web = await pnp.sp.web();
	// console.log('Connected to site named', web.Title);
	// // get all the attachments
	// const info: IAttachmentInfo[] = await item.attachmentFiles();
	// console.log('Connected to site named', info);
	// if (info.length > 0) {
	// 	const file = info[0];
	// 	// Download the file as a Blob
	// 	const fileBlob = await item.attachmentFiles.getByName(file.FileName).getBlob();

	// 	// Convert the Blob to an ArrayBuffer
	// 	const arrayBuffer = await fileBlob.arrayBuffer();

	// 	// Convert the ArrayBuffer to a Node Buffer and then to a base64 string
	// 	const base64String = Buffer.from(arrayBuffer).toString('base64');

	// 	// Use the Blob's MIME type if available, otherwise fallback to a generic type
	// 	const mimeType = fileBlob.type || 'application/octet-stream';

	// 	// Create a data URL with the base64 string
	// 	const dataUrl = `data:${mimeType};base64,${base64String}`;

	// 	console.log('Data URL:', dataUrl);

	// 	// Now you can use `dataUrl` as the href for a link, e.g., write it to a file or send it in a response.
	// }

	//const attachments = await item.attachmentFiles
	console.log('done');
}
main();
