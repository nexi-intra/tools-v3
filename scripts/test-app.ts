/**
 * Asynchronously instantiates and runs the ToolsApp to synchronize data and user profiles.
 *
 * @remarks
 * 1. Performs synchronization operations with optional force flag.
 * 2. Syncs user profiles with the option to create only if needed.
 * 3. Logs completion once all operations are finished.
 *
 * @returns A promise that resolves when all operations complete.
 */
import { ToolsApp } from '@/internal/app-tools';
import prisma from '@/prisma';

async function main() {
	const app = new ToolsApp();

	// const item = await prisma.tool.findFirst({
	// 	where: {
	// 		koksmat_masterdataref: 'https://christianiabpos.sharepoint.com/sites/nexiintra-home/lists/all tools',
	// 		koksmat_masterdata_id: '15',
	// 	},
	// });
	// if (!item) {
	// 	return;
	// }

	// app.syncSharePointItem(item);
	await app.syncronizeAll({ force: true });

	// User profiles are synchronized with the createOnly flag set to true.
	//await app.syncUserProfiles({ createOnly: true, force: false });
}
main();
