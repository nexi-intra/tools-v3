import { ToolsApp } from '@/internal/app-tools';
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
	console.log('done');
}
main();
