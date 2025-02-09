import { z } from 'zod';

export const translationJSONDatabaseField = z.object({
	fields: z.object({
		name: z.object({
			language: z.string(),
			original: z.string(),
			translations: z.array(z.object({ language: z.string(), translation: z.string() })),
		}),
		description: z.object({
			language: z.string(),
			original: z.string(),
			translations: z.array(z.object({ language: z.string(), translation: z.string() })),
		}),
	}),
	source_language: z.string(),
});

export type TranslationJSONDatabaseField = z.infer<typeof translationJSONDatabaseField>;
