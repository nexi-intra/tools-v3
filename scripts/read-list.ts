import { genericSharePointItem } from "@/services/office-graph/models";
import { SharePointGraphClient } from "@/services/office-graph/sharepoint";

import { z } from "zod";

async function main() {
  const tenantId = process.env.APP_TENANT_ID!;
  const clientId = process.env.APP_CLIENT_ID!;
  const clientSecret = process.env.APP_CLIENT_SECRET!;

  const sharePointClient = new SharePointGraphClient(
    tenantId,
    clientId,
    clientSecret,
    process.env.TOOL_SITE!
  );

  const siteId = await sharePointClient.getSiteId();
  console.log("Site ID:", siteId);

  const lists = await sharePointClient.getLists();
  console.log("Lists:", lists.length);
  for (const list of lists) {
    //  console.log("List:", list.name, list.id);
  }

  const list = await sharePointClient.getList("Tool Collections");
  console.log("List:", list.name, "id", list.id);

  const items = await sharePointClient.getSharePointItems(
    list.id,
    100,
    genericSharePointItem
  );
  console.log("Items:", items.length);

  //console.log(" Users:", allUsers);
}
main();
