import { z } from "zod";

export const SharedAttributes = z.object({
  id: z.number().describe("Unique identifier"),
  name: z.string().describe("Name"),
  created_at: z.coerce.date().describe(`Created date`),
  created_by: z.string().describe(`Created by
    ID of the user who created this entity`),
  updated_at: z.coerce.date().describe(`Updated date`),
  updated_by: z.string().describe(`Updated by
    ID of the user who updated this entity`),
  deleted_at: z.coerce.date().nullable().describe(`Soft deletion date
      If soft deleted, the date of deletion`),
  calculatedsearchindex: z.string().nullable().optional()
    .describe(`Calculated search index
    optional field that can be used to store a calculated search index`),
  deletedBy: z
    .string()
    .nullable()
    .optional()

    .describe("ID of the user who deleted this entity, if applicable"),
});

// Schema for individual translations
const translationSchema = z.object({
  language: z.string().optional().nullable(),
  translation: z.string().optional().nullable(),
});

// Schema for each field (e.g., name, description)
const fieldSchema = z.object({
  language: z.string().optional().nullable(),
  original: z.string().optional().nullable(),
  translations: z.array(translationSchema),
});

// Main schema encompassing all fields and the source language
export const translationsSchema = z
  .object({
    fields: z.record(fieldSchema),
    source_language: z.string(),
  })
  .optional()
  .nullable();

// TypeScript types inferred from Zod schemas
type Translation = z.infer<typeof translationSchema>;
type Field = z.infer<typeof fieldSchema>;
type TranslationsData = z.infer<typeof translationsSchema>;

// --- Function Implementation ---

/**
 * Retrieves the translation for a specified field and language.
 *
 * @param data - The validated data object.
 * @param fieldName - The name of the field to retrieve (e.g., "name", "description").
 * @param languageCode - The target language code (e.g., "en", "da").
 * @param defaultValue - The value to return if the translation is not found.
 * @returns The translated string if available; otherwise, the default value.
 */
export function getTranslation(
  data: TranslationsData | null,
  fieldName: string,
  languageCode: string,
  defaultValue: string
): string {
  if (!data) {
    return defaultValue;
  }
  const field: Field | undefined = data.fields[fieldName];

  if (!field) {
    console.warn(
      `Field "${fieldName}" does not exist. Returning default value.`
    );
    return defaultValue;
  }

  // Find the translation matching the languageCode
  const translation: Translation | undefined = field.translations.find(
    (t) => t.language?.toLowerCase() === languageCode.toLowerCase()
  );

  if (translation) {
    return translation.translation!;
  } else {
    console.warn(
      `Translation for language "${languageCode}" not found in field "${fieldName}". Returning default value.`
    );
    return defaultValue;
  }
}

// --- Example Usage ---
/*
// Sample data to validate
const sampleData = {
  fields: {
    name: {
      language: "it",
      original: "Success Factors",
      translations: [
        { language: "en", translation: "Success Factors" },
        { language: "da", translation: "Succesfaktorer" },
        { language: "el", translation: "Παράγοντες επιτυχίας" },
        { language: "pl", translation: "Czynniki sukcesu" },
      ],
    },
    description: {
      language: "it",
      original: "La nuova piattaforma HR per la gestione del personale",
      translations: [
        { language: "en", translation: "The new HR platform for personnel management" },
        { language: "da", translation: "Den nye HR-platform til personaleledelse" },
        { language: "el", translation: "Η νέα πλατφόρμα HR για τη διαχείριση προσωπικού" },
        { language: "pl", translation: "Nowa platforma HR do zarządzania personelem" },
      ],
    },
  },
  source_language: "it",
};

// Validate the data
const validationResult = mainSchema.safeParse(sampleData);

if (validationResult.success) {
  const validatedData: MainData = validationResult.data;

  // Retrieve translations
  const nameInEnglish = getTranslation(validatedData, "name", "en", "Default Name");
  const descriptionInGerman = getTranslation(validatedData, "description", "de", "Default Description");

  console.log("Name in English:", nameInEnglish);
  console.log("Description in German:", descriptionInGerman); // Will return default since "de" is not available
} else {
  console.error("Validation failed:", validationResult.error.errors);
}
*/
