import { LoggerInterface } from '@/interfaces/Logger';
import { SharePointGraphClient, splitUrl } from '@/services/office-graph/sharepoint';
import { z } from 'zod';
import {
	SpLinkFieldSchema,
	SpMetadataFieldSchema,
	SpPersonFieldSchema,
	ToolFormatTypes,
	ToolsSchema,
	ToolsSchemaType,
} from './models';
import { ToolsApp } from './tools-app';

export class ToolSpokeSite extends SharePointGraphClient {
	private _toolListName: string;
	private _app: ToolsApp;
	constructor(app: ToolsApp, sharePointListUrl: string) {
		const credentials = app.credentials;
		super(credentials.tenantId, credentials.clientId, credentials.clientSecret, sharePointListUrl, app.log);
		this._app = app;
		this._toolListName = decodeURIComponent(sharePointListUrl.toLowerCase().split('/lists/')[1].split('/')[0]);
	}

	masterdataKey() {
		const { host, site } = splitUrl(this.url);
		return `${host}/sites/${site}/lists/${this._toolListName}`;
	}

	async getToolListName() {
		return decodeURIComponent(this._toolListName);
	}

	async getToolItem(format: ToolFormatTypes, id: string): Promise<ToolsSchemaType> {
		const listname = await this.getToolListName();
		let result: z.infer<typeof ToolsSchema> = {
			id: '',
			_UIVersionString: '',
			Category: '',
			TitleEnglish: '',
			CreatedBy: '',
			UpdateBy: '',
			Link: { Description: '', Url: '' },
		};
		switch (format) {
			case 'V1':
				let v1model = z.object({
					id: z.string(),
					_UIVersionString: z.string(),
					Category: z.string(),
					Title: z.string(),
					Description: z.string().optional(),

					Translation_x0020_Language_x0020: SpMetadataFieldSchema.optional(),
					Translation_x0020_Language_x00200: SpMetadataFieldSchema.optional(),
					Translation_x0020_Language_x00201: SpMetadataFieldSchema.optional(),
					Translation_x0020_1_x0020_Title: z.string().optional(),
					Translation_x0020_2_x0020_Title: z.string().optional(),
					Translation_x0020_3_x0020_Title: z.string().optional(),

					Translation_x0020_1_x0020_Descri: z.string().optional(),
					Translation_x0020_2_x0020_Descri: z.string().optional(),
					Translation_x0020_3_x0020_Descri: z.string().optional(),

					Document1: SpLinkFieldSchema.optional(),
					Document2: SpLinkFieldSchema.optional(),
					Document3: SpLinkFieldSchema.optional(),
					Document4: SpLinkFieldSchema.optional(),
					Document5: SpLinkFieldSchema.optional(),
					Document6: SpLinkFieldSchema.optional(),
					Link: SpLinkFieldSchema,
					Business_x0020_Purpose: SpMetadataFieldSchema.optional(),
					//          Digital_x0020_Workplace: SpMetadataFieldSchema.optional(),
					Icon: z.string().optional(),
					createdBy: SpPersonFieldSchema,
					lastModifiedBy: SpPersonFieldSchema,
				});

				const item = await this.getSharePointItem(listname, id, v1model);
				if (!item) {
					this.logger.error(`Tool item with id ${id} not found`);
				}
				const tool: ToolsSchemaType = {
					id: item.id,
					_UIVersionString: item._UIVersionString,
					Category: item.Category,
					DescriptionEnglish: item.Description,
					TitleEnglish: item.Title!,
					TranslatedTitle1: item.Translation_x0020_1_x0020_Title,
					TranslatedTitle2: item.Translation_x0020_2_x0020_Title,
					TranslatedTitle3: item.Translation_x0020_3_x0020_Title,

					Link: item.Link,
					Icon: item.Icon,
					TranslatedLanguage1: item.Translation_x0020_Language_x0020,
					TranslatedLanguage2: item.Translation_x0020_Language_x00200,
					TranslatedLanguage3: item.Translation_x0020_Language_x00201,
					TranslatedDescription1: item.Translation_x0020_1_x0020_Descri,
					TranslatedDescription2: item.Translation_x0020_2_x0020_Descri,
					TranslatedDescription3: item.Translation_x0020_3_x0020_Descri,
					Document1: item.Document1,
					Document2: item.Document2,
					Document3: item.Document3,
					Document4: item.Document4,
					Document5: item.Document5,
					Document6: item.Document6,
					Business_Purpose: item.Business_x0020_Purpose,
					// Digital_Workplace: item.Digital_x0020_Workplace
					//   ? [item.Digital_x0020_Workplace]
					//   : [],

					UpdateBy: item.lastModifiedBy.user.email,
					CreatedBy: item.createdBy.user.email,
				};
				result = tool;
				break;

			default:
				this.logger.error('Invalid format', format);
				break;
		}
		return result;
	}

	async getToolItems(format: ToolFormatTypes): Promise<ToolsSchemaType[]> {
		const listname = await this.getToolListName();
		let result: z.infer<typeof ToolsSchema>[] = [];
		switch (format) {
			case 'V1':
				let v1model = z.object({
					id: z.string(),
					_UIVersionString: z.string(),
					Category: z.string(),
					Title: z.string(),
					Description: z.string().optional(),

					Translation_x0020_Language_x0020: SpMetadataFieldSchema.optional(),
					Translation_x0020_Language_x00200: SpMetadataFieldSchema.optional(),
					Translation_x0020_Language_x00201: SpMetadataFieldSchema.optional(),
					Translation_x0020_1_x0020_Title: z.string().optional(),
					Translation_x0020_2_x0020_Title: z.string().optional(),
					Translation_x0020_3_x0020_Title: z.string().optional(),

					Translation_x0020_1_x0020_Descri: z.string().optional(),
					Translation_x0020_2_x0020_Descri: z.string().optional(),
					Translation_x0020_3_x0020_Descri: z.string().optional(),

					Document1: SpLinkFieldSchema.optional(),
					Document2: SpLinkFieldSchema.optional(),
					Document3: SpLinkFieldSchema.optional(),
					Document4: SpLinkFieldSchema.optional(),
					Document5: SpLinkFieldSchema.optional(),
					Document6: SpLinkFieldSchema.optional(),
					Link: SpLinkFieldSchema,
					Business_x0020_Purpose: SpMetadataFieldSchema.optional(),
					//          Digital_x0020_Workplace: SpMetadataFieldSchema.optional(),
					Icon: z.string().optional(),
					createdBy: SpPersonFieldSchema,
					lastModifiedBy: SpPersonFieldSchema,
				});

				const v1Items = await this.getSharePointItems(listname, 100, v1model);
				result = v1Items.map(item => {
					const tool: ToolsSchemaType = {
						id: item.id,
						_UIVersionString: item._UIVersionString,
						Category: item.Category,
						DescriptionEnglish: item.Description,
						TitleEnglish: item.Title!,
						TranslatedTitle1: item.Translation_x0020_1_x0020_Title,
						TranslatedTitle2: item.Translation_x0020_2_x0020_Title,
						TranslatedTitle3: item.Translation_x0020_3_x0020_Title,

						Link: item.Link,
						Icon: item.Icon,
						TranslatedLanguage1: item.Translation_x0020_Language_x0020,
						TranslatedLanguage2: item.Translation_x0020_Language_x00200,
						TranslatedLanguage3: item.Translation_x0020_Language_x00201,
						TranslatedDescription1: item.Translation_x0020_1_x0020_Descri,
						TranslatedDescription2: item.Translation_x0020_2_x0020_Descri,
						TranslatedDescription3: item.Translation_x0020_3_x0020_Descri,
						Document1: item.Document1,
						Document2: item.Document2,
						Document3: item.Document3,
						Document4: item.Document4,
						Document5: item.Document5,
						Document6: item.Document6,
						Business_Purpose: item.Business_x0020_Purpose,
						// Digital_Workplace: item.Digital_x0020_Workplace
						//   ? [item.Digital_x0020_Workplace]
						//   : [],

						UpdateBy: item.lastModifiedBy.user.email,
						CreatedBy: item.createdBy.user.email,
					};
					return tool;
				});
				break;

			default:
				this.logger.error('Invalid format', format);
				break;
		}
		return result;
	}
}
