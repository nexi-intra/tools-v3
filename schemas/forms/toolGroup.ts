import { z } from "zod";

import { SharedAttributes } from "../_shared";

export const ToolGroupSchema = SharedAttributes.extend({
  name: z.string().describe("Name of the tool group"),
  description: z.string().describe("Description of the tool group"),
});
