import { OfficeGraphClient } from '@/services/office-graph';

import { z, ZodSchema, ZodType } from 'zod';
import { genericSharePointItem } from './models';

import { LoggerInterface } from '@/models/Logger';
/*
  url = https://site.sharepoint.com/sites/site-name/lists/list-name/items/item-id
  */
export async function splitUrl(url: string) {
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
		this._siteUrl = sharePointSiteUrl;
	}

	async getSiteId() {
		if (this._siteId) {
			return this._siteId;
		}

		try {
			const url = await splitUrl(this._siteUrl);
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
	async getItem<T extends ZodType<any, any, any>>(listId: string, itemId: string, schema: ZodSchema<any>) {
		const siteId: string = await this.getSiteId();
		const item = await this.get(
			`/sites/${siteId}/lists/${listId}/items/${itemId}`,
			{ $expand: 'fields' },
			schema,
		);
		return item;
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
}
