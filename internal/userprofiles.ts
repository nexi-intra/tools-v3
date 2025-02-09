import { OfficeGraphClient } from '@/services/office-graph';

import { z, ZodSchema, ZodType } from 'zod';

import { LoggerInterface } from '@/models/Logger';
// Validate a GET response using a Zod schema.
const usersSchema = z.object({
	value: z.array(
		z.object({
			id: z.string(),
			displayName: z.string(),
			userPrincipalName: z.string(),
		}),
	),
});

const onPremisesExtensionAttributesSchema = z.object({
	extensionAttribute1: z.string().nullable(),
	extensionAttribute2: z.string().nullable(),
	extensionAttribute3: z.string().nullable(),
	extensionAttribute4: z.string().nullable(),
	extensionAttribute5: z.string().nullable(),
	extensionAttribute6: z.string().nullable(),
	extensionAttribute7: z.string().nullable(),
	extensionAttribute8: z.string().nullable(),
	extensionAttribute9: z.string().nullable(),
	extensionAttribute10: z.string().nullable(),
	extensionAttribute11: z.string().nullable(),
});
export class UserGraphClient extends OfficeGraphClient {
	constructor(
		tenantId: string,
		clientId: string,
		clientSecret: string,

		logger?: LoggerInterface,
	) {
		super(tenantId, clientId, clientSecret, logger);
	}

	async getUsers() {
		const users = await this.getAllPages(
			`users`,
			{
				$select: 'displayName,id,userPrincipalName,onPremisesExtensionAttributes,Country,Companyname',
			},
			10000, // max page size 10000 * 100 = 1 mill
			z.array(
				z.object({
					id: z.string(),
					displayName: z.string(),
					userPrincipalName: z.string(),
					Country: z.string().nullable().optional(),
					Companyname: z.string().nullable().optional(),
					onPremisesExtensionAttributes: onPremisesExtensionAttributesSchema.optional(),
				}),
			),
		);
		return users;
	}
}
