import { z } from "zod";

import { SharedAttributes } from "../_shared";

export const PurposeSchema = SharedAttributes.extend({
  name: z.string().describe("Name of the purpose"),
  description: z.string().describe("Description of the purpose"),
  category: z.string().describe("Category of the purpose"),
});
