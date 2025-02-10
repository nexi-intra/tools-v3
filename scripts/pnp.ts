import { SPDefault, GraphDefault } from '@pnp/nodejs';
import { spfi } from '@pnp/sp';
import { graphfi } from '@pnp/graph';
import { AzureIdentity } from '@pnp/azidjsclient';
import '@pnp/graph/users';
import '@pnp/sp/webs';
import { ClientCertificateCredential } from '@azure/identity';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as forge from 'node-forge';

async function main() {
	// Retrieve configuration values from environment variables
	const tenantId = process.env.PNPTENANTID!;
	const clientId = process.env.PNPAPPID!;
	const site = process.env.PNPSITE!;

	// Base64-encoded PFX (PKCS#12) file and its password (if applicable)
	const pfxBase64 = process.env.PNPCERTIFICATE!;
	const pfxPassword = ''; //process.env.PNPPFXPASSWORD!; // Leave empty string if not password-protected

	// Decode the base64 string into a Buffer (binary PFX data)
	const pfxBuffer = Buffer.from(pfxBase64, 'base64');

	// Convert the binary PFX data into a PEM-formatted string using node-forge
	// (node-forge requires a binary string, so convert the buffer accordingly)
	const binaryPfx = pfxBuffer.toString('binary');
	const p12Asn1 = forge.asn1.fromDer(binaryPfx);
	const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, pfxPassword);

	// Extract the private key.
	// First try to get a pkcs8ShroudedKeyBag (most common for PFX files)
	let keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
	let keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
	if (!keyBag || keyBag.length === 0) {
		// Fallback to unencrypted key bag if needed
		keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
		keyBag = keyBags[forge.pki.oids.keyBag];
	}
	if (!keyBag || keyBag.length === 0) {
		throw new Error('No private key found in the PFX file.');
	}
	const privateKey = keyBag[0].key;
	if (!privateKey) {
		throw new Error('No private key found in the PFX file.');
	}
	const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

	// Extract the certificate.
	const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
	const certBag = certBags[forge.pki.oids.certBag];
	if (!certBag || certBag.length === 0) {
		throw new Error('No certificate found in the PFX file.');
	}
	const certificate = certBag[0].cert;
	if (!certificate) {
		throw new Error('No certificate found in the PFX file.');
	}
	const certificatePem = forge.pki.certificateToPem(certificate);

	// Combine the certificate and private key into one PEM-formatted string.
	const combinedPem = certificatePem + '\n' + privateKeyPem;

	// Write the PEM string to a temporary file.
	const tempDir = os.tmpdir();
	const pemFilePath = path.join(tempDir, 'tempCertificate.pem');
	fs.writeFileSync(pemFilePath, combinedPem);
	console.log(`PEM file written to: ${pemFilePath}`);

	// Create a ClientCertificateCredential using the PEM file.
	const credential = new ClientCertificateCredential(tenantId, clientId, pemFilePath);

	// Replace with your tenant name as needed.
	const tenant = 'christianiabpos';

	// Configure SharePoint with application permissions using AzureIdentity.
	const sp = spfi(`https://${tenant}.sharepoint.com/sites/nexiintra-home`).using(
		SPDefault(),
		AzureIdentity(credential, [`https://${tenant}.sharepoint.com/.default`]),
	);

	// Configure Microsoft Graph with application permissions using AzureIdentity.
	const graph = graphfi().using(GraphDefault(), AzureIdentity(credential, ['https://graph.microsoft.com/.default']));

	// Example: Retrieve SharePoint web details.
	const webData = await sp.web();
	console.log('SharePoint site title:', webData.Title);

	// Example: Retrieve a list of users (avoid using /me in app-only mode).
	const users = await graph.users();
	console.log('First user from Graph:', users[0]);

	// Optionally, remove the temporary PEM file if no longer needed.
	// fs.unlinkSync(pemFilePath);
}

main().catch(e => {
	console.error('Error:', e);
});
