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
import { LoggerInterface } from '@/interfaces/Logger';
import { logger } from './logger';
import { UserGraphClient } from './userprofiles';
import { syncUserProfiles } from './sync-user-profiles';
import { getTranslation } from '@/schemas/_shared';

import { DefaultArgs, JsonValue } from '@prisma/client/runtime/library';
import { PrismaTransaction } from '@/interfaces/prisma';
import { Country, PrismaClient, Tool, UserProfile, UserRole } from '@prisma/client';
import { OfficeGraphClient } from '@/services/office-graph';
import { getKoksmatTokenCookie } from '@/lib/auth';
async function upsertToolTranslations(
	tx: PrismaTransaction,
	dbItem: {
		id: number;
		koksmat_masterdataref: string | null;
		koksmat_masterdata_id: string | null;
		koksmat_masterdata_etag: string | null;
	},
	englishLanguage: {
		id: number;
		created_at: Date;
		created_by: string | null;
		updated_at: Date;
		updated_by: string | null;
		deleted_at: Date | null;
		name: string;
		description: string | null;
		translations: JsonValue | null;
		code: string;
		sortorder: string | null;
	},
	translations: {
		fields: {
			name: {
				translations: { language: string; translation: string }[];
				language: string;
				original: string;
			};
			description: {
				translations: { language: string; translation: string }[];
				language: string;
				original: string;
			};
		};
		source_language: string;
	},
	sharePointItem: {
		id: string;
		_UIVersionString: string;
		Category: string;
		TitleEnglish: string;
		CreatedBy: string;
		UpdateBy: string;
		Link: { Description: string; Url: string };
		TranslatedLanguage1?: { Label: string } | undefined;
		TranslatedLanguage2?: { Label: string } | undefined;
		TranslatedLanguage3?: { Label: string } | undefined;
		TranslatedTitle1?: string | undefined;
		TranslatedTitle2?: string | undefined;
		TranslatedTitle3?: string | undefined;
		DescriptionEnglish?: string | undefined;
		TranslatedDescription1?: string | undefined;
		TranslatedDescription2?: string | undefined;
		TranslatedDescription3?: string | undefined;
		Document1?: { Description: string; Url: string } | undefined;
		Document2?: { Description: string; Url: string } | undefined;
		Document3?: { Description: string; Url: string } | undefined;
		Document4?: { Description: string; Url: string } | undefined;
		Document5?: { Description: string; Url: string } | undefined;
		Document6?: { Description: string; Url: string } | undefined;
		Icon?: string | undefined;
		Business_Purpose?: { Label: string } | undefined;
		Digital_Workplace?: { Label: string }[] | undefined;
	},
	italianLanguage: {
		id: number;
		created_at: Date;
		created_by: string | null;
		updated_at: Date;
		updated_by: string | null;
		deleted_at: Date | null;
		name: string;
		description: string | null;
		translations: JsonValue | null;
		code: string;
		sortorder: string | null;
	},
) {
	await tx.toolTexts.upsert({
		// Use the composite unique key (toolId, languageId)
		where: {
			toolId_languageId: {
				toolId: dbItem.id,
				languageId: englishLanguage.id,
			},
		},
		update: {
			name: getTranslation(translations, 'name', 'en', sharePointItem.TitleEnglish!),
			description: getTranslation(translations, 'description', 'en', sharePointItem.DescriptionEnglish!),
		},
		create: {
			name: getTranslation(translations, 'name', 'en', sharePointItem.TitleEnglish!),
			description: getTranslation(translations, 'description', 'en', sharePointItem.DescriptionEnglish!),
			tool: { connect: { id: dbItem.id } },
			language: { connect: { id: englishLanguage.id } },
		},
	});

	// Upsert the Italian translation for this tool
	await tx.toolTexts.upsert({
		where: {
			toolId_languageId: {
				toolId: dbItem.id,
				languageId: italianLanguage.id,
			},
		},
		update: {
			name: getTranslation(translations, 'name', 'it', sharePointItem.TitleEnglish!),
			description: getTranslation(translations, 'description', 'it', sharePointItem.DescriptionEnglish!),
		},
		create: {
			name: getTranslation(translations, 'name', 'it', sharePointItem.TitleEnglish!),
			description: getTranslation(translations, 'description', 'it', sharePointItem.DescriptionEnglish!),
			tool: { connect: { id: dbItem.id } },
			language: { connect: { id: italianLanguage.id } },
		},
	});
}
type SynclogTypes = 'update' | 'create' | 'delete';
interface UserWithRoles extends UserProfile {
	roles: UserRole[];
}
export class ToolsApp {
	private toolsHubSharePoint: SharePointGraphClient;
	private _tenantId: string;
	private _clientId: string;
	private _clientSecret: string;
	private _user: UserWithRoles | null = null;
	private _msGraph: OfficeGraphClient | null = null;
	public get log(): LoggerInterface {
		return logger;
	}

	constructor() {
		const toolSite = process.env.TOOL_SITE;
		if (!toolSite) {
			throw new Error('TOOL_SITE environment variable not set');
		}
		this._tenantId = process.env.APP_TENANT_ID!;
		this._clientId = process.env.APP_CLIENT_ID!;
		this._clientSecret = process.env.APP_CLIENT_SECRET!;
		this.toolsHubSharePoint = new SharePointGraphClient(
			this._tenantId,
			this._clientId,
			this._clientSecret,
			toolSite,
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
	async user() {
		if (!this._user) {
			const token = await getKoksmatTokenCookie();
			const userProfile = await prisma.userProfile.findFirst({
				where: {
					id: token?.userId,
				},
				include: {
					roles: true,
				},
			});
			if (!userProfile) {
				throw new Error('User not found');
			}
			this._user = userProfile;
		}
		return this._user;
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

	syncOne(listurl: string, id: string) {
		const site = new ToolSpokeSite(this, listurl);
		site.getToolItems;
		//this.syncItem()
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

			this.log.highlight(`Database Tools ${name} number of records ${db.length}`);
			if (options.force) {
				this.log.highlight('Force option enabled, all records will be updated');
			}
			const items = await site.getToolItems(format);
			let created = 0;
			let updated = 0;
			let deleted = 0; // Ensure the Languages exist (if not done elsewhere)
			const englishLanguage = await prisma.language.upsert({
				where: { name: 'English' },
				update: {},
				create: { name: 'English', code: 'en' },
			});
			const italianLanguage = await prisma.language.upsert({
				where: { name: 'Italian' },
				update: {},
				create: { name: 'Italian', code: 'it' },
			});

			await Promise.all(
				items.map(async sharePointItem => {
					const result = await this.syncItem(site, sharePointItem, koksmat_masterdataref, options);
					if (result?.created) created++;
					if (result?.updated) updated++;
				}),
			);

			// Any code here will execute only after all the above asynchronous operations have completed.

			this.log.highlight(
				`Database Tools Sync done: ${name} ${created} created ${updated} "updated" ${deleted} deleted`,
			);
		}
	}
	async syncItem(
		site: ToolSpokeSite,
		sharePointItem: ToolsSchemaType,
		koksmat_masterdataref: string,
		options: { force: boolean } = { force: false },
	) {
		const englishLanguage = await prisma.language.upsert({
			where: { name: 'English' },
			update: {},
			create: { name: 'English', code: 'en' },
		});
		const italianLanguage = await prisma.language.upsert({
			where: { name: 'Italian' },
			update: {},
			create: { name: 'Italian', code: 'it' },
		});
		const dbItem = await prisma.tool.findFirst({
			where: {
				koksmat_masterdataref: koksmat_masterdataref,
				koksmat_masterdata_id: sharePointItem.id,
			},
		});
		const result = {
			created: 0,
			updated: 0,
			deleted: 0,
		};

		const translations = ToolsApp.buildTranslations(sharePointItem);
		if (dbItem) {
			if (dbItem.koksmat_masterdata_etag === sharePointItem._UIVersionString && !options.force) {
				this.log.verbose(
					`SharePoint : ${sharePointItem.id}`,
					koksmat_masterdataref,
					sharePointItem.id,
					sharePointItem._UIVersionString,
					'No changes',
				);
				return result;
			}
			/**
			 *  --------------------------------------------------------------------------------
			 *  Updating
			 *  --------------------------------------------------------------------------------
			 *  */
			this.log.info(
				`SharePoint : ${sharePointItem.id}`,
				koksmat_masterdataref,
				sharePointItem.id,
				sharePointItem._UIVersionString,
				'Updating item',
			);

			const image = await site.getSharePointFirstItemAttachment(
				await site.getToolListName(),
				parseInt(sharePointItem.id),
			);
			try {
				// Now run the update and upserts in a transaction:
				const updatedRecord = await prisma.$transaction(async tx => {
					// Update the Tool record
					/**
					 * Updates a tool record in the database with the provided SharePoint item data.
					 *
					 * @param {Object} tx - The transaction object used to perform the update.
					 * @param {Object} dbItem - The database item to be updated.
					 * @param {Object} sharePointItem - The SharePoint item containing the updated data.
					 * @returns {Promise<Object>} The updated tool record.
					 *
					 * @property {string} koksmat_masterdata_etag - The eTag from the SharePoint item.
					 * @property {string} name - The English title of the SharePoint item.
					 * @property {string} description - The English description of the SharePoint item.
					 * @property {string} updated_by - The user who updated the SharePoint item.
					 * @property {string} created_by - The user who created the SharePoint item.
					 * @property {Object} documents - The document collection built from the SharePoint item.
					 * @property {Object} translations - The translations built from the SharePoint item.
					 * @property {Object} purposes - The business purpose of the tool, connected or created if not existing.
					 * @property {Object} category - The category of the tool, connected or created if not existing.
					 */
					const countryLookup: Map<string, Country> = new Map();
					const countries = await prisma.country.findMany();
					const countryReferences = [];
					if (sharePointItem.id === '47') {
						console.log(1);
					}
					if (sharePointItem.Countries) {
						for (const country of sharePointItem.Countries) {
							if (!countryLookup.has(country.LookupValue)) {
								const countryRecord = countries.find(c => c.name === country.LookupValue);
								if (countryRecord) {
									countryLookup.set(country.LookupValue, countryRecord);
								} else {
									const newCountry = await tx.country.create({
										data: {
											name: country.LookupValue,
											region: {
												connectOrCreate: {
													where: {
														name: 'Unknown',
													},
													create: {
														name: 'Unknown',
													},
												},
											},
										},
									});
									countryLookup.set(country.LookupValue, newCountry);
								}
								countryReferences.push({ id: countryRecord?.id! });
							}
						}
					}
					sharePointItem?.Countries
						? sharePointItem?.Countries.map(async country => {
								return await prisma.country.findFirst({
									where: { name: country.LookupValue },
								});
						  })
						: [];
					const updatedTool = await tx.tool.update({
						where: { id: dbItem.id },
						data: {
							koksmat_masterdata_etag: sharePointItem._UIVersionString,
							name: sharePointItem.TitleEnglish,
							description: sharePointItem.DescriptionEnglish,
							updated_by: sharePointItem.UpdateBy,
							created_by: sharePointItem.CreatedBy,
							icon: image!,
							documents: ToolsApp.buildDocumentCollection(sharePointItem),
							translations: ToolsApp.buildTranslations(sharePointItem),
							countries: {
								set: countryReferences,
							},
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
									where: { name: sharePointItem.Category },
									create: { name: sharePointItem.Category },
								},
							},
						},
					});

					await upsertToolTranslations(
						tx,
						dbItem,
						englishLanguage,
						translations,
						sharePointItem,
						italianLanguage,
					);

					return updatedTool;
				});
				this.log.info('Updated', updatedRecord.id);
				result.updated++;
				await this.writeSyncLogInfo('update', {
					sharePointItem,
					updatedRecord,
				});
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

			this.log.info(
				`SharePoint : ${sharePointItem.id}`,
				koksmat_masterdataref,
				sharePointItem.id,
				sharePointItem._UIVersionString,
				'New item',
			);
			try {
				const newRecord = await prisma.tool.create({
					data: {
						// Don't set eTag for new records to ensure that the update is triggered on the next sync
						koksmat_masterdata_etag: '', // sharePointItem._UIVersionString,
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

				this.log.info('Created', newRecord.id);
				result.created++;
			} catch (error) {
				this.log.error('Syncronising Tools', (error as Error).message);
				await this.writeSyncLogError('create', { sharePointItem }, error as Error);
			}
		}
		return result;
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

	/*
	 * Asynchronously instantiates and runs the ToolsApp to synchronize data and user profiles.
	 *
	 * @remarks
	 * 1. Performs synchronization operations with optional force flag.
	 * 2. Syncs user profiles with the option to create only if needed.
	 * 3. Logs completion once all operations are finished.
	 *
	 * @returns A promise that resolves when all operations complete.
	 */
	async syncronizeAll(options: { force: boolean } = { force: false }) {
		const toolLists = await this.listsToSync();

		this.log.highlight('Syncronising Tools');
		toolLists.forEach(async tool => {
			this.log.info('Tool:', tool.name, tool.format);
			const koksmat_masterdataref = tool.site.masterdataKey();

			this.syncList(
				tool.name,
				tool.format,

				koksmat_masterdataref,
				tool.site,
				options,
			);
		});
	}

	async syncSharePointItem(item: Tool) {
		if (!item.koksmat_masterdataref || !item.koksmat_masterdata_id) {
			this.log.error('syncSharePointItem', 'Invalid item', item);
			return;
		}
		const site = new ToolSpokeSite(this, item.koksmat_masterdataref);
		const sharePointItem = await site.getToolItem('V1', item.koksmat_masterdata_id);
		await this.syncItem(site, sharePointItem, item.koksmat_masterdataref, { force: true });
	}

	async createSharePointItem(sharePointListUrl: string, id: string) {
		const site = new ToolSpokeSite(this, sharePointListUrl);
		const sharePointItem = await site.getToolItem('V1', id);
		await this.syncItem(site, sharePointItem, sharePointListUrl);
	}
	async mayReadDomain(domain: string) {
		const user = await this.user();
		if (!user) {
			throw new Error('User not found');
		}
		const domainRecord = prisma.guestDomain.findFirst({
			where: {
				name: domain,
			},
		});
		if (!domainRecord) {
			throw new Error('Domain not found');
		}

		if (user.email.endsWith(domain)) {
			return true;
		}
		return false;
	}

	async isSuperAdmin(user: UserWithRoles) {
		if (user.roles.some(role => role.name === 'superadmin')) {
			return true;
		}
		return false;
	}

	public get isRing1(): boolean {
		if (this._user?.roles.some(role => role.name === 'ring1')) {
			return true;
		}
		return false;
	}
	public get isDev(): boolean {
		if (this._user?.roles.some(role => role.name === 'dev')) {
			return true;
		}
		return false;
	}
	public get msGraph() {
		if (!this._msGraph) {
			this._msGraph = new OfficeGraphClient(this._tenantId, this._clientId, this._clientSecret, logger);
		}
		return this._msGraph;
	}
}
