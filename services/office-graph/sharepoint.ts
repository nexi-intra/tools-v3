import { OfficeGraphClient } from '@/services/office-graph';

import { z, ZodSchema, ZodType } from 'zod';
import { genericSharePointItem } from './models';

import { LoggerInterface } from '@/interfaces/Logger';
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
import { ToolsApp } from '@/internal/tools-app';
import { ToolSpokeSite } from '@/internal/toolspokesite';
import { IAttachmentInfo } from '@pnp/sp/attachments';
import { IItem } from '@pnp/sp/items/types';
import '@pnp/sp/webs';
import '@pnp/sp/lists/web';
import '@pnp/sp/items';
import '@pnp/sp/attachments';

/*
  url = https://site.sharepoint.com/sites/site-name/lists/list-name/items/item-id
  */
export function splitUrl(url: string) {
	const parts1 = url.split('https://');
	const parts2 = parts1[1].split('/sites/');
	const dns = parts2[0];
	const parts3 = parts2[1].split('/');
	const site = parts3[0];
	const siteUrl = 'https://' + dns + '/sites/' + site;
	return { siteUrl, host: 'https://' + dns, site };
}

// Define the default schema
const defaultSchema = z.object({
	Title: z.string(),
	id: z.string(),
});
export const ListWithColumnDefinitions = z.object({
	'@odata.context': z.string(),
	'@odata.etag': z.string(),
	createdDateTime: z.string(),
	description: z.string(),
	eTag: z.string(),
	id: z.string(),
	lastModifiedDateTime: z.string(),
	name: z.string(),
	webUrl: z.string(),
	displayName: z.string(),

	parentReference: z.object({ siteId: z.string() }),
	list: z.object({
		contentTypesEnabled: z.boolean(),
		hidden: z.boolean(),
		template: z.string(),
	}),
	'columns@odata.context': z.string(),
	columns: z.array(
		z.object({
			columnGroup: z.string(),
			description: z.string(),
			displayName: z.string(),
			enforceUniqueValues: z.boolean(),
			hidden: z.boolean(),
			id: z.string(),
			indexed: z.boolean(),
			name: z.string(),
			readOnly: z.boolean(),
			required: z.boolean(),
			text: z
				.object({
					allowMultipleLines: z.boolean(),
					appendChangesToExistingText: z.boolean(),
					linesForEditing: z.number(),
					maxLength: z.number().optional(),
				})
				.optional(),
			choice: z
				.object({
					allowTextEntry: z.boolean(),
					choices: z.array(z.string()),
					displayAs: z.string(),
				})
				.optional(),
			lookup: z
				.object({
					allowMultipleValues: z.boolean(),
					allowUnlimitedLength: z.boolean(),
					columnName: z.string(),
					listId: z.string(),
					primaryLookupColumnId: z.string().optional(),
				})
				.optional(),
			calculated: z.object({ formula: z.string(), outputType: z.string() }).optional(),
			dateTime: z.object({ displayAs: z.string(), format: z.string() }).optional(),
			personOrGroup: z
				.object({
					allowMultipleSelection: z.boolean(),
					displayAs: z.string(),
					chooseFromType: z.string(),
				})
				.optional(),
		}),
	),
});

export class SharePointGraphClient extends OfficeGraphClient {
	//private _listDefintions: Map<string, z.infer<typeof ListWithColumnDefinitions>>;
	private _siteId: string = '';
	private _siteUrl: string;
	constructor(
		tenantId: string,
		clientId: string,
		clientSecret: string,
		sharePointSiteUrl: string,
		logger?: LoggerInterface,
	) {
		super(tenantId, clientId, clientSecret, logger);
		this._siteUrl = splitUrl(sharePointSiteUrl).siteUrl;
	}

	async getSiteId() {
		if (this._siteId) {
			return this._siteId;
		}

		try {
			const url = splitUrl(this._siteUrl);
			const siteUrl = url.siteUrl.replace('sharepoint.com/', 'sharepoint.com:/').replace('https://', '');

			const site = await this.get(`/sites/${siteUrl}`, {});
			this._siteId = site.id;
		} catch (error) {
			console.log(error);
			this.logger.error('Error getting site id');
		}
		return this._siteId;
	}

	async getLists() {
		const siteId: string = await this.getSiteId();
		const lists = await this.getAllPages(
			`/sites/${siteId}/lists`,
			{ $select: 'name,id' },
			100,
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
				}),
			),
		);
		return lists;
	}

	async getList(listId: string) {
		const siteId: string = await this.getSiteId();
		const list = await this.get(
			`/sites/${siteId}/lists/${listId}`,
			{},
			z.object({
				id: z.string(),
				name: z.string(),
				displayName: z.string(),
				description: z.string(),
				webUrl: z.string(),
			}),
		);
		return list;
	}

	async getListDefinition(listId: string) {
		const siteId: string = await this.getSiteId();
		const list = await this.get(`/sites/${siteId}/lists/${listId}`, {
			$expand: 'columns',
		});
		return ListWithColumnDefinitions.parse(list);
	}

	async getSharePointItems<T extends ZodType<any, any, any>>(
		listId: string,
		maxPages: number = 100,
		schema: T,
	): Promise<z.infer<T>[]> {
		const siteId: string = await this.getSiteId();
		const items = (
			await this.getAllPages(
				`/sites/${siteId}/lists/${listId}/items`,
				{
					$expand: 'fields',
				},
				maxPages,
			)
		).map(item => {
			return {
				fields: {
					...item.fields,
					createdBy: item.createdBy,
					lastModifiedBy: item.lastModifiedBy,
				},
			};
		});
		const itemFields = z
			.array(
				z.object({
					fields: schema,
				}),
			)
			.parse(items) as z.infer<typeof schema>[];
		return itemFields.map(item => {
			return {
				...item.fields,
			};
		});
	}

	async getItemsMap<T extends ZodType<any, any, any>>(listId: string, maxPages: number = 100, schema: T) {
		const items = await this.getSharePointItems(listId, maxPages, schema);
		const itemsMap = new Map<string, z.infer<T>>();
		for (const item of items) {
			itemsMap.set(item.id, schema.parse(item)) as z.infer<T>;
		}
		return itemsMap;
	}
	async getSharePointItem<T extends ZodType<any, any, any>>(listId: string, itemId: string, schema: ZodSchema<any>) {
		const siteId: string = await this.getSiteId();
		const wrappedShema = z.object({
			fields: schema,
		});
		const item = await this.get(`/sites/${siteId}/lists/${listId}/items/${itemId}`, { $expand: 'fields' });
		const wrappedItem = { ...item.fields, createdBy: item.createdBy, lastModifiedBy: item.lastModifiedBy };
		const parsedItem = schema.safeParse(wrappedItem);
		if (!parsedItem.success) {
			this.logger.warn('Error parsing item', parsedItem.error);
			return null;
		}
		return parsedItem.data;
	}

	async getSiteMetadata() {
		this.logger.verbose('Getting site metadata for site');
		const _lists = await this.getLists();
		const listDefintions: Map<string, z.infer<typeof ListWithColumnDefinitions>> = new Map();
		for (const list of _lists) {
			this.logger.verbose('Getting site metadata for list ' + list.name);
			const listDefinition = await this.getListDefinition(list.id);
			listDefintions.set(list.id, listDefinition);
		}
		return listDefintions;
	}

	public get url(): string {
		return this._siteUrl;
	}

	/**
	 * Fetch attachments for a given SharePoint list item.
	 */
	async getItemAttachments<T extends ZodType<any, any, any>>(
		listId: string,
		itemId: string,
		schema: ZodSchema<any>,
	) {
		const siteId: string = await this.getSiteId();
		const item = await this.get(`/sites/${siteId}/lists/${listId}/items/${itemId}/attachments`, {}, schema);
		return item;
	}
	async getPnpConnections() {
		// Retrieve configuration values from environment variables
		const tenantId = process.env.PNPTENANTID!;
		const clientId = process.env.PNPAPPID!;

		const tenant = process.env.PNPTENANT!; // 'christianiabpos';
		if (!tenantId || !clientId || !tenant) {
			throw new Error(`Missing required environment variables
			(PNPTENANTID, PNPAPPID, PNPTENANT).
			Please ensure these are set before running this script.`);
		}
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
		this.logger.verbose(`PEM file written to: ${pemFilePath}`);

		// Create a ClientCertificateCredential using the PEM file.
		const credential = new ClientCertificateCredential(tenantId, clientId, pemFilePath);

		// Configure SharePoint with application permissions using AzureIdentity.
		const sp = spfi(this._siteUrl).using(
			SPDefault(),
			AzureIdentity(credential, [`https://${tenant}.sharepoint.com/.default`]),
		);

		// Configure Microsoft Graph with application permissions using AzureIdentity.
		const graph = graphfi().using(
			GraphDefault(),
			AzureIdentity(credential, ['https://graph.microsoft.com/.default']),
		);

		return { sp, graph };
	}

	async getSharePointFirstItemAttachment(listName: string, itemId: number) {
		const pnp = await this.getPnpConnections();
		const item = await pnp.sp.web.lists.getByTitle(listName).items.getById(itemId);
		const web = await pnp.sp.web();
		this.logger.info('Connected to site named', web.Title);
		// get all the attachments
		const info: IAttachmentInfo[] = await item.attachmentFiles();

		if (info.length > 0) {
			const file = info[0];
			// Download the file as a Blob
			const fileBlob = await item.attachmentFiles.getByName(file.FileName).getBlob();

			// Convert the Blob to an ArrayBuffer
			const arrayBuffer = await fileBlob.arrayBuffer();

			// Convert the ArrayBuffer to a Node Buffer and then to a base64 string
			const base64String = Buffer.from(arrayBuffer).toString('base64');

			// Use the Blob's MIME type if available, otherwise fallback to a generic type
			const mimeType = fileBlob.type || 'application/octet-stream';

			// Create a data URL with the base64 string
			const dataUrl = `data:${mimeType};base64,${base64String}`;

			this.logger.verbose('Data URL:', dataUrl);
			return dataUrl;
			// Now you can use `dataUrl` as the href for a link, e.g., write it to a file or send it in a response.
		} else {
			this.logger.verbose('No attachments found');
			return null;
		}
	}
}
