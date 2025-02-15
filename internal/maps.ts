import { SupportedLanguage } from '@/contexts/language-context';
import { getTranslation } from '@/schemas/_shared';
import { documentsJSONDatabaseFieldSchema, translationJSONDatabaseFieldSchema } from '@/schemas/database';
import { ToolView } from '@/schemas/forms';
import { Tool } from '@prisma/client';

export function mapTool2ToolView(
	language: SupportedLanguage,
	tool: Tool,
	categoryName: string,
	categoryColor: string,
	categoryId: number,
	categoryOrder: string,
): ToolView {
	const parsedTranslations = translationJSONDatabaseFieldSchema.safeParse(tool.translations);
	if (!parsedTranslations.success) {
		console.error(parsedTranslations.error);
	}
	const translatedName = getTranslation(parsedTranslations.data, 'name', language, tool.name);
	const translatedDescription = getTranslation(parsedTranslations.data, 'description', language, tool.description!);
	const parsedDocuments = documentsJSONDatabaseFieldSchema.safeParse(tool.documents);
	if (!parsedDocuments.success) {
		console.error(parsedDocuments.error);
	}

	const toolView: ToolView = {
		purposes: [],
		description: translatedDescription,
		status: 'deprecated',
		deleted_at: null,
		category: { value: categoryName, color: categoryColor, id: categoryId, order: categoryOrder },
		name: translatedName,
		id: tool.id,
		created_at: new Date(),
		created_by: '',
		updated_at: new Date(),
		updated_by: '',
		url: tool.url,
		icon: tool.icon!,
		documents: parsedDocuments.data ?? [],
		groupId: '',
		tags: [],
		version: '',
	};
	return toolView;
}
