import { ToolsApp } from "@/internal/tools-app";
import { ToolSpokeSite } from "@/internal/toolspokesite";

import { z } from "zod";

async function main() {
  const app = new ToolsApp();
  const toolSpokeSite = new ToolSpokeSite(
    app,
    "https://christianiabpos.sharepoint.com/sites/nexiintra-country-dk/Lists/Tools"
  );

  const listname = await toolSpokeSite.getToolListName();
  const lists = await toolSpokeSite.getLists();
  console.log("Lists:", lists.length);

  const items = await toolSpokeSite.getSharePointItems(
    listname,
    100,
    z.object({
      id: z.string(),
      Title: z.string(),
      Description: z.string(),
    })
  );
  console.log("Items:", items.length);
}
main();
