import { z } from 'zod';

export const CollectionListSchema = z.object({
	'@odata.etag': z.string(),
	Title: z.string(),

	List: z.string(),
	View_x0020_Tools: z.string(),
	FormatLookupId: z.string(),
	id: z.string(),
	ContentType: z.string(),
	Modified: z.string(),
	Created: z.string(),
	AuthorLookupId: z.string(),
	EditorLookupId: z.string(),
	_UIVersionString: z.string(),
	Attachments: z.boolean(),
});

export const LanguagesSchema = z.object({
	'@odata.etag': z.string(),
	Title: z.string(),
	id: z.string(),
	Code: z.string(),
	ContentType: z.string(),
	Modified: z.string(),
	Created: z.string(),
	AuthorLookupId: z.string(),
	EditorLookupId: z.string(),
	_UIVersionString: z.string(),
	Attachments: z.boolean(),
});

export const SpLinkFieldSchema = z.object({
	Description: z.string(),
	Url: z.string(),
});
export type SpLinkFieldType = z.infer<typeof SpLinkFieldSchema>;

export const SpMetadataFieldSchema = z.object({
	Label: z.string(),
});

export type SpMetadataFieldType = z.infer<typeof SpMetadataFieldSchema>;

export const SpPersonFieldSchema = z.object({
	user: z.object({
		email: z.string(),
		id: z.string(),
		displayName: z.string(),
	}),
});

export type SpPersonFieldType = z.infer<typeof SpPersonFieldSchema>;

export const SpLookupFieldSchema = z.object({
	LookupId: z.number(),
	LookupValue: z.string(),
});

export type SpLookupFieldType = z.infer<typeof SpLookupFieldSchema>;

export const ToolsSchema = z.object({
	id: z.string(),
	_UIVersionString: z.string(),
	Category: z.string(),

	TranslatedLanguage1: SpMetadataFieldSchema.optional(),
	TranslatedLanguage2: SpMetadataFieldSchema.optional(),
	TranslatedLanguage3: SpMetadataFieldSchema.optional(),

	TitleEnglish: z.string(),
	TranslatedTitle1: z.string().optional(),
	TranslatedTitle2: z.string().optional(),
	TranslatedTitle3: z.string().optional(),

	DescriptionEnglish: z.string().optional(),
	TranslatedDescription1: z.string().optional(),
	TranslatedDescription2: z.string().optional(),
	TranslatedDescription3: z.string().optional(),

	CreatedBy: z.string(),
	UpdateBy: z.string(),

	Document1: SpLinkFieldSchema.optional(),
	Document2: SpLinkFieldSchema.optional(),
	Document3: SpLinkFieldSchema.optional(),
	Document4: SpLinkFieldSchema.optional(),
	Document5: SpLinkFieldSchema.optional(),
	Document6: SpLinkFieldSchema.optional(),
	Link: SpLinkFieldSchema,
	Icon: z.string().optional(),
	Business_Purpose: SpMetadataFieldSchema.optional(),
	Digital_Workplace: z.array(SpMetadataFieldSchema).optional(),
});

export type ToolsSchemaType = z.infer<typeof ToolsSchema>;
const TranslatationSchema = z.object({
	language: z.string(),
	translation: z.string(),
});
export type TranslatationType = z.infer<typeof TranslatationSchema>;

const TranslationObjectSchema = z.object({
	language: z.string(),
	original: z.string(),
	translations: z.array(TranslatationSchema),
});
export type TranslationObjectType = z.infer<typeof TranslationObjectSchema>;
export const TranslationsSchema = z.object({
	fields: z.object({
		name: TranslationObjectSchema,
		description: TranslationObjectSchema,
	}),
	source_language: z.string(),
});

export type TranslationsType = z.infer<typeof TranslationsSchema>;
export type ToolFormatTypes = 'V1' | 'Unsupported';

export const SharePointRegionSchema = z.object({
	'@odata.etag': z.string(),
	Title: z.string(),
	id: z.string(),
	// SortOrder: z.string(),
	ContentType: z.string(),
	Modified: z.string(),
	Created: z.string(),
	AuthorLookupId: z.string(),
	EditorLookupId: z.string(),
	_UIVersionString: z.string(),
	Attachments: z.boolean(),
});

export const SharePointCountrySchema = z.object({
	id: z.string(),
	_UIVersionString: z.string(),
	Rolluppage: SpLinkFieldSchema,
	Region_x0020_Item_x003a_Sort_x00LookupId: z.string(),
	Title: z.string(),
	Description: z.string().optional(),

	createdBy: SpPersonFieldSchema,
	lastModifiedBy: SpPersonFieldSchema,
});

export const SharePointNewsCategoriesSchema = z.object({
	id: z.string(),
	_UIVersionString: z.string(),
	SortOrder: z.number(),

	Title: z.string(),

	createdBy: SpPersonFieldSchema,
	lastModifiedBy: SpPersonFieldSchema,
});

export const SharePointUnitSchema = z.object({
	id: z.string(),
	_UIVersionString: z.string(),
	Rolluppage: SpLinkFieldSchema,
	UnitType: z.string(),
	Title: z.string(),
	SortOrder: z.number(),
	code: z.string(),
	Site: SpLinkFieldSchema,
	createdBy: SpPersonFieldSchema,
	lastModifiedBy: SpPersonFieldSchema,
});

export const SharePointChannelSchema = z.object({
	id: z.string(),
	_UIVersionString: z.string(),
	Email: z.string().optional(),
	GroupID: z.string().optional(),
	Title: z.string(),
	SortOrder: z.number().optional(),
	Mandatory: z.boolean(),
	webUrl: z.string().optional(),
	RelevantUnits: z.array(SpLookupFieldSchema),
	RelevantCountires: z.array(SpLookupFieldSchema),
	NewsCategoryLookupId: z.string().optional(),
	RegionLookupId: z.string().optional(),
	//createdBy: SpPersonFieldSchema,
	//lastModifiedBy: SpPersonFieldSchema,
});
