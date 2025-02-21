import {
	LanguagesSchema,
	SharePointChannelSchema,
	SharePointCountrySchema,
	SharePointNewsCategoriesSchema,
	SharePointRegionSchema,
	SharePointUnitSchema,
	SpLinkFieldSchema,
	SpPersonFieldSchema,
} from '@/internal/models';
import prisma from '@/prisma';
import { genericSharePointItem } from '@/services/office-graph/models';
import { SharePointGraphClient } from '@/services/office-graph/sharepoint';

import { z } from 'zod';

async function main() {
	const tenantId = process.env.APP_TENANT_ID!;
	const clientId = process.env.APP_CLIENT_ID!;
	const clientSecret = process.env.APP_CLIENT_SECRET!;

	const sharePointClient = new SharePointGraphClient(
		tenantId,
		clientId,
		clientSecret,
		'https://christianiabpos.sharepoint.com/sites/nexiintra-home/Lists/Countries/AllItems.aspx',
	);

	const siteId = await sharePointClient.getSiteId();
	console.log('Site ID:', siteId);

	const lists = await sharePointClient.getLists();
	console.log('Lists:', lists.length);
	for (const list of lists) {
		//  console.log("List:", list.name, list.id);
	}

	// await syncRegions(sharePointClient);
	// await syncCountries(sharePointClient);
	// await syncCategories(sharePointClient);
	// await syncUnits(sharePointClient);
	await syncChannels(sharePointClient);
	//console.log(" Users:", allUsers);
}
main();

async function syncRegions(sharePointClient: SharePointGraphClient) {
	const list = await sharePointClient.getList('Regions');
	const items = await sharePointClient.getSharePointItems(list.id, 100, genericSharePointItem);
	console.log('Number of regions:', items.length);
	for (const item of items) {
		await prisma.region.upsert({
			where: { name: item.Title },
			update: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				sortOrder: item.Title,
			},
			create: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				sortOrder: item.Title,
				name: item.Title,
			},
		});
		// console.log("Item:", item);
	}
}
async function syncCategories(sharePointClient: SharePointGraphClient) {
	const list = await sharePointClient.getList('News Categories');
	const items = await sharePointClient.getSharePointItems(list.id, 100, SharePointNewsCategoriesSchema);
	console.log('Number of news categories:', items.length);
	for (const item of items) {
		await prisma.channelCategory.upsert({
			where: { name: item.Title },
			update: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				sortorder: item.SortOrder.toString(),
			},
			create: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				sortorder: item.SortOrder.toString(),
				name: item.Title,
			},
		});
		// console.log("Item:", item);
	}
}

async function syncCountries(sharePointClient: SharePointGraphClient) {
	const lookupRegions = await sharePointClient.getItemsMap('Regions', 100, SharePointRegionSchema);

	const list = await sharePointClient.getList('Countries');
	const items = await sharePointClient.getSharePointItems(list.id, 100, SharePointCountrySchema);
	console.log('Number of countries:', items.length);
	for (const item of items) {
		const sharePointregion = lookupRegions.get(item.Region_x0020_Item_x003a_Sort_x00LookupId);
		const region = await prisma.region.findFirst({
			where: { name: sharePointregion?.Title },
			select: { id: true },
		});

		const region_id = region?.id;
		if (!region_id) {
			sharePointClient.logger.error('Region not found for country:', item.Title);
			continue;
		}
		await prisma.country.upsert({
			where: { name: item.Title },
			update: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				homePageUrl: item.Rolluppage.Url,
				region_id: region_id,
			},
			create: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				name: item.Title,
				homePageUrl: item.Rolluppage.Url,
				region_id: region_id,
			},
		});
		// console.log("Item:", item);
	}
}

async function syncUnits(sharePointClient: SharePointGraphClient) {
	const list = await sharePointClient.getList('Units');
	const items = await sharePointClient.getSharePointItems(list.id, 100, SharePointUnitSchema);
	console.log('Number of units:', items.length);
	for (const item of items) {
		await prisma.businessUnit.upsert({
			where: { name: item.Title },
			update: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				sortorder: item.SortOrder.toString(),
				homePageUrl: item.Site.Url,
				newsPageUrl: item.Rolluppage.Url,
				isGroupFunction: item.UnitType !== 'Business Unit',
				code: item.code,
			},
			create: {
				created_by: item.createdBy.user.email,
				updated_by: item.lastModifiedBy.user.email,

				name: item.Title,
				code: item.code,
				sortorder: item.SortOrder.toString(),
				homePageUrl: item.Site.Url,
				newsPageUrl: item.Rolluppage.Url,
				isGroupFunction: item.UnitType !== 'Business Unit',
			},
		});
		// console.log("Item:", item);
	}
}

async function syncChannels(sharePointClient: SharePointGraphClient) {
	const lookupCategories = await sharePointClient.getItemsMap(
		'News Categories',
		100,
		SharePointNewsCategoriesSchema,
	);

	const lookupRegions = await sharePointClient.getItemsMap('Regions', 100, genericSharePointItem);
	const list = await sharePointClient.getList('News Channels');
	const items = await sharePointClient.getSharePointItems(list.id, 100, SharePointChannelSchema);
	console.log('Number of news channels:', items.length);
	for (const item of items) {
		const channelCategorySharePointItem = lookupCategories.get(item.NewsCategoryLookupId!);
		const channelCategoryItem = await prisma.channelCategory.findFirst({
			where: { name: channelCategorySharePointItem?.Title },
			select: { id: true },
		});

		const regionSharePointItem = lookupRegions.get(item.RegionLookupId!);
		const regionItem = await prisma.region.findFirst({
			where: { name: regionSharePointItem?.Title },
			select: { id: true },
		});

		const countryReferences = await Promise.all(
			item.RelevantCountires.map(async country => {
				const countryId = await prisma.country.findFirst({
					where: { name: { equals: country.LookupValue, mode: 'insensitive' } },
					select: { id: true },
				});
				return countryId;
			}),
		);

		await prisma.channel.upsert({
			where: { name: item.Title },
			update: {
				created_by: 'system',
				updated_by: 'system',
				externalGroup: item.GroupID,
				categoryId: channelCategoryItem?.id,
				regionId: regionItem?.id,
				mandatory: item.Mandatory,
				countries: {
					connect: countryReferences.map(c => ({ id: c?.id })),
				},
			},
			create: {
				created_by: 'system',
				updated_by: 'system',
				externalGroup: item.GroupID,
				name: item.Title,
				mandatory: item.Mandatory,
				countries: {
					connect: countryReferences.map(c => ({ id: c?.id })),
				},
				categoryId: channelCategoryItem?.id,
				regionId: regionItem?.id,
				//region: {},
			},
		});
		// console.log("Item:", item);
	}
}
