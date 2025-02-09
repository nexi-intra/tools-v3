import { SharePointGraphClient } from '@/services/office-graph/sharepoint';

import prisma from '@/prisma';

import {
	CollectionListSchema,
	LanguagesSchema,
	SpLinkFieldType,
	ToolFormatTypes,
	ToolsSchemaType,
	TranslationsType,
} from './models';
import { genericSharePointItem } from '@/services/office-graph/models';
import { ToolSpokeSite } from './toolspokesite';
import { LoggerInterface } from '@/models/Logger';
import { logger } from './logger';
import { UserGraphClient } from './userprofiles';
import { syncUserProfiles } from './sync-user-profiles';

type SynclogTypes = 'update' | 'create' | 'delete';
export class ToolsApp {
	private toolsHubSharePoint: SharePointGraphClient;
	private _tenantId: string;
	private _clientId: string;
	private _clientSecret: string;

	public get log(): LoggerInterface {
		return logger;
	}

	constructor() {
		this._tenantId = process.env.APP_TENANT_ID!;
		this._clientId = process.env.APP_CLIENT_ID!;
		this._clientSecret = process.env.APP_CLIENT_SECRET!;
		this.toolsHubSharePoint = new SharePointGraphClient(
			this._tenantId,
			this._clientId,
			this._clientSecret,
			process.env.TOOL_SITE!,
			logger,
		);
	}

	public get credentials(): {
		tenantId: string;
		clientId: string;
		clientSecret: string;
	} {
		return {
			tenantId: this._tenantId,
			clientId: this._clientId,
			clientSecret: this._clientSecret,
		};
	}

	async toolLists() {
		return await this.toolsHubSharePoint.getSharePointItems('Tool Collections', 100, CollectionListSchema);
	}

	async writeSyncLogInfo(category: SynclogTypes, details: object) {
		await prisma.synchronizationLog.create({
			data: {
				name: 'Syncronising Tools',
				category,
				details,
				hasError: false,
			},
		});
	}
	async writeSyncLogError(category: SynclogTypes, details: object, error: Error) {
		try {
			await prisma.synchronizationLog.create({
				data: {
					name: 'Syncronising Tools',
					category,
					details,
					error: (error as Error).message,
					hasError: true,
				},
			});
		} catch (error) {
			this.log.error('Syncronising Tools', (error as Error).message);
		}
	}

	getToolSpokeSite(listurl: string) {
		const site = new ToolSpokeSite(this, listurl);
		return site;
	}
	static buildDocumentCollection(tool: ToolsSchemaType) {
		const docs: { name: string; url: string }[] = [];
		const pushDoc = (doc?: SpLinkFieldType) => {
			if (!doc) return;
			docs.push({
				name: doc.Description,
				url: doc.Url,
			});
		};
		pushDoc(tool.Document1);
		pushDoc(tool.Document2);
		pushDoc(tool.Document3);
		pushDoc(tool.Document4);
		pushDoc(tool.Document5);
		pushDoc(tool.Document6);

		return docs;
	}

	static buildTranslations(tool: ToolsSchemaType) {
		const translations: TranslationsType = {
			source_language: 'en',
			fields: {
				name: {
					language: 'en',
					original: tool.TitleEnglish,
					translations: [],
				},
				description: {
					language: 'en',
					original: tool.DescriptionEnglish!,
					translations: [],
				},
			},
		};

		if (tool.TranslatedTitle1) {
			translations.fields.name.translations.push({
				language: tool.TranslatedLanguage1?.Label ?? 'Unknown',
				translation: tool.TranslatedTitle1,
			});
		}

		if (tool.TranslatedTitle2) {
			translations.fields.name.translations.push({
				language: tool.TranslatedLanguage2?.Label ?? 'Unknown',
				translation: tool.TranslatedTitle2,
			});
		}
		if (tool.TranslatedTitle3) {
			translations.fields.name.translations.push({
				language: tool.TranslatedLanguage3?.Label ?? 'Unknown',
				translation: tool.TranslatedTitle3,
			});
		}
		if (tool.TranslatedDescription1) {
			translations.fields.description.translations.push({
				language: tool.TranslatedLanguage1?.Label ?? 'Unknown',
				translation: tool.TranslatedDescription1,
			});
		}

		if (tool.TranslatedDescription2) {
			translations.fields.description.translations.push({
				language: tool.TranslatedLanguage2?.Label ?? 'Unknown',
				translation: tool.TranslatedDescription2,
			});
		}
		if (tool.TranslatedDescription3) {
			translations.fields.description.translations.push({
				language: tool.TranslatedLanguage3?.Label ?? 'Unknown',
				translation: tool.TranslatedDescription3,
			});
		}
		return translations;
	}
	async syncList(
		name: string,
		format: ToolFormatTypes,

		koksmat_masterdataref: string,
		site: ToolSpokeSite,
		options: { force: boolean } = { force: false },
	) {
		{
			this.log.info('Tool:', name, format);

			const db = await prisma.tool.findMany({
				where: {
					koksmat_masterdataref: {
						startsWith: koksmat_masterdataref,
					},
				},
				select: {
					id: true,
					koksmat_masterdataref: true,
					koksmat_masterdata_etag: true,
					koksmat_masterdata_id: true,
				},
			});

			this.log.highlight(`Database Tools ${name}  number of records ${db.length}`);
			if (options.force) {
				this.log.highlight('Force option enabled, all records will be updated');
			}
			const items = await site.getToolItems(format);
			let created = 0;
			let updated = 0;
			let deleted = 0;
			await Promise.all(
				items.map(async sharePointItem => {
					const dbItem = db.find(item => item.koksmat_masterdata_id === sharePointItem.id);
					if (dbItem) {
						if (
							dbItem.koksmat_masterdata_etag === sharePointItem._UIVersionString &&
							!options.force
						) {
							this.log.verbose(
								`SharePoint : ${sharePointItem.id}`,
								koksmat_masterdataref,
								sharePointItem.id,
								sharePointItem._UIVersionString,
								'No changes',
							);
							return;
						}
						/**
						 *  --------------------------------------------------------------------------------
						 *  Updating
						 *  --------------------------------------------------------------------------------
						 *  */
						this.log.highlight(
							`SharePoint : ${sharePointItem.id}`,
							koksmat_masterdataref,
							sharePointItem.id,
							sharePointItem._UIVersionString,
							'Updating item',
						);
						try {
							const updatedRecord = await prisma.tool.update({
								where: {
									id: dbItem.id,
								},
								data: {
									koksmat_masterdata_etag: sharePointItem._UIVersionString,
									name: sharePointItem.TitleEnglish,
									description: sharePointItem.DescriptionEnglish,
									updated_by: sharePointItem.UpdateBy,
									created_by: sharePointItem.CreatedBy,
									documents: ToolsApp.buildDocumentCollection(sharePointItem),

									translations: ToolsApp.buildTranslations(sharePointItem),
									purposes: {
										connectOrCreate: {
											where: {
												name: sharePointItem.Business_Purpose?.Label ?? 'Unknown',
											},
											create: {
												name: sharePointItem.Business_Purpose?.Label ?? 'Unknown',
											},
										},
									},

									category: {
										connectOrCreate: {
											where: {
												name: sharePointItem.Category,
											},
											create: {
												name: sharePointItem.Category,
											},
										},
									},
								},
							});
							this.log.info('Updated', updatedRecord.id);
							await this.writeSyncLogInfo('update', {
								sharePointItem,
								updatedRecord,
							});

							updated++;
						} catch (error) {
							this.log.error('Syncronising Tools', (error as Error).message);
							await this.writeSyncLogError('update', { sharePointItem }, error as Error);
						}
					} else {
						/**
						 *  --------------------------------------------------------------------------------
						 *  Creating
						 *  --------------------------------------------------------------------------------
						 *  */

						this.log.highlight(
							`SharePoint : ${sharePointItem.id}`,
							koksmat_masterdataref,
							sharePointItem.id,
							sharePointItem._UIVersionString,
							'New item',
						);
						try {
							const newRecord = await prisma.tool.create({
								data: {
									koksmat_masterdata_etag: sharePointItem._UIVersionString,
									koksmat_masterdata_id: sharePointItem.id,
									koksmat_masterdataref: koksmat_masterdataref,
									updated_by: sharePointItem.UpdateBy,
									created_by: sharePointItem.CreatedBy,
									documents: ToolsApp.buildDocumentCollection(sharePointItem),
									url: sharePointItem.Link.Url,
									purposes: {
										connectOrCreate: {
											where: {
												name: sharePointItem.Business_Purpose?.Label ?? 'Unknown',
											},
											create: {
												name: sharePointItem.Business_Purpose?.Label ?? 'Unknown',
											},
										},
									},

									category: {
										connectOrCreate: {
											where: {
												name: sharePointItem.Category,
											},
											create: {
												name: sharePointItem.Category,
											},
										},
									},
									name: sharePointItem.TitleEnglish!,
									description: sharePointItem.DescriptionEnglish!,
								},
							});
							await this.writeSyncLogInfo('create', {
								sharePointItem,
								newRecord,
							});

							created++;
							this.log.info('Created', newRecord.id);
						} catch (error) {
							this.log.error('Syncronising Tools', (error as Error).message);
							await this.writeSyncLogError('create', { sharePointItem }, error as Error);
						}
					}
				}),
			);

			// Any code here will execute only after all the above asynchronous operations have completed.

			this.log.highlight(
				`Database Tools Sync done: ${name} ${created} created ${updated} "updated" ${deleted} deleted`,
			);
		}
	}

	async syncUserProfiles(
		options: { force: boolean; createOnly: boolean } = {
			force: false,
			createOnly: false,
		},
	) {
		const userProfileClient = new UserGraphClient(
			this._tenantId,
			this._clientId,
			this._clientSecret,

			logger,
		);
		await syncUserProfiles(this, userProfileClient, {
			force: options.force,
			createOnly: options.createOnly,
		});
	}

	async listsToSync() {
		const LookupLanguages = await this.toolsHubSharePoint.getItemsMap('Languages', 100, LanguagesSchema);
		const LookupFormats = await this.toolsHubSharePoint.getItemsMap(
			'Tool List Formats',
			100,
			genericSharePointItem,
		);
		const _toolCollections = await this.toolsHubSharePoint.getSharePointItems(
			'Tool Collections',
			100,
			CollectionListSchema,
		);

		const toolList = _toolCollections.map(item => {
			const tool = {
				id: item.id,

				format: LookupFormats.get(item.FormatLookupId)?.Title! as ToolFormatTypes,

				listUrl: item.List,
				name: item.Title,
				site: this.getToolSpokeSite(item.List),
			};
			return tool;
		});
		return toolList;
	}
	async syncronizeAll(options: { force: boolean } = { force: false }) {
		const toolLists = await this.listsToSync();

		this.log.highlight('Syncronising Tools');
		toolLists.forEach(async tool => {
			this.log.info('Tool:', tool.name, tool.format);
			const koksmat_masterdataref = await tool.site.masterdataKey();

			this.syncList(
				tool.name,
				tool.format,

				koksmat_masterdataref,
				tool.site,
				options,
			);
		});
	}
}
