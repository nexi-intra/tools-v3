import { SPDefault, GraphDefault } from '@pnp/nodejs';
import { spfi } from '@pnp/sp';
import { graphfi } from '@pnp/graph';
import { Configuration, AuthenticationParameters } from 'msal';
import { AzureIdentity } from '@pnp/azidjsclient';
import '@pnp/graph/users';
import '@pnp/sp/webs';
import { ClientSecretCredential } from '@azure/identity';
async function main() {
	const tenantId = process.env.APP_TENANT_ID!;
	const clientId = process.env.APP_CLIENT_ID!;
	const clientSecret = process.env.APP_CLIENT_SECRET!;
	const tenant = 'christianiabpos';

	const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

	const sp = await spfi(`https://${tenant}.sharepoint.com/sites/nexiintra-home`).using(
		SPDefault(),
		AzureIdentity(credential, [`https://${tenant}.sharepoint.com/.default`]),
	);

	const graph = graphfi().using(GraphDefault(), AzureIdentity(credential, ['https://graph.microsoft.com/.default']));
	// const webData = await sp.web();
	// console.log('Hello ', webData.Title);

	const users = await graph.users();
	console.log('Users:', users[0]);
}
main();
