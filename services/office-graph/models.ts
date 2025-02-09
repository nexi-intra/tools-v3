import { z, ZodType } from "zod";

export const genericSharePointItem = z.object({
  "@odata.etag": z.string(),
  Title: z.string(),
  id: z.string(),
  ContentType: z.string().optional(),
  Modified: z.string(),
  Created: z.string(),
  AuthorLookupId: z.string(),
  EditorLookupId: z.string(),
  _UIVersionString: z.string(),
  Attachments: z.boolean(),
});
