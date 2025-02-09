import { z } from "zod";

import { SharedAttributes } from "../_shared";

export const TagSchema = SharedAttributes.extend({
  name: z.string().describe("Name of the tag"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Color of the tag in hexadecimal format"),
});
