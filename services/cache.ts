'use server';

import { Country, NewsCategory, NewsChannel, Unit } from '@/schemas/profile';
import { getSpAuthToken } from './office-graph';
import { getCountries, getNewsCategories, getNewsChannels, getUnits, getValidGuestDomains } from './sharepoint';
import { https } from '@/contexts/httphelper';

const KEY = 'profilecache';
export interface ProfileCache {
	date: Date;
	key: string;
	countries: Country[];
	categories: NewsCategory[];
	units: Unit[];
	channels: NewsChannel[];
}

export async function readProfileData() {
	const token = await getSpAuthToken();
	await getValidGuestDomains(token);

	const countries = (await getCountries(token)) ?? [];
	const categories = (await getNewsCategories(token)) ?? [];
	const units = (await getUnits(token)) ?? [];
	const channels = (await getNewsChannels(token)) ?? [];
	const cache: ProfileCache = {
		date: new Date(),
		key: KEY,
		countries,
		categories,
		units,
		channels,
	};
	return cache;
}

export async function getProfileCache() {
	const href = process.env.NEWSCHANNELSBLOB;
	if (!href) {
		throw new Error('No newschannels blob, specify a value in the environment for NEWSCHANNELSBLOB');
	}

	const data = await https<ProfileCache>('', 'GET', href);
	return data;
}
