import { z } from 'zod';

export interface Me {
	'@odata.context': string;
	'@microsoft.graph.tips': string;
	businessPhones: string[];
	displayName: string;
	givenName: string;
	jobTitle: any;
	mail: string;
	mobilePhone: string;
	officeLocation: string;
	preferredLanguage: string;
	surname: string;
	userPrincipalName: string;
	id: string;
}

export const newsSchema = z.object({
	id: z.string(),
	channelName: z.string(),
	channelType: z.string(),
	channelCode: z.string(),
	sortOrder: z.string(),
	RelevantUnits: z
		.object({
			LookupId: z.number(),
			LookupValue: z.string(),
		})
		.array()
		.nullable(),
	Mandatory: z.boolean(),
	RelevantCountires: z
		.object({
			LookupId: z.number(),
			LookupValue: z.string(),
		})
		.array()
		.nullable(),
	RegionId: z.number().nullable(),
	NewsCategoryId: z.number().nullable(),
	GroupId: z.string().nullable(),
});

export type NewsChannel = z.infer<typeof newsSchema>;

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const countrySchema = z.object({
	countryName: z.string(),
	countryCode: z.string(),
});

export type Country = z.infer<typeof countrySchema>;

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const unitSchema = z.object({
	unitName: z.string(),
	unitCode: z.string(),
	unitType: z.string(),
	sortOrder: z.number(),
});

export type Unit = z.infer<typeof unitSchema>;

export const ValidGuestDomainSchema = z.object({
	domainName: z.string(),
	redirectURL: z.string(),
});

export type ValidGuestDomain = z.infer<typeof ValidGuestDomainSchema>;

export const newscategorySchema = z.object({
	categoryName: z.string(),
	categoryId: z.number(),
	sortOrder: z.number(),
});

export type NewsCategory = z.infer<typeof newscategorySchema>;

export const membershipSchema = z.object({
	groupDisplayName: z.string(),
	//mailNickname:z.string(),
	groupId: z.string(),
});

export type Membership = z.infer<typeof membershipSchema>;
