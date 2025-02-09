import { SharePointGraphClient } from "@/services/office-graph/sharepoint";
import { PrismaClient, Prisma } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

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

  const listDef = await sharePointClient.getSiteMetadata();
  listDef.forEach((list) => {
    console.log("List:", list.name);
    list.columns.forEach((column) => {
      if (column.lookup) {
        console.log(
          "  Column:",
          column.name,
          "Lookup:",
          column.lookup.columnName
        );
      }
    });
  });
  //fs.writeFileSync("list-def.json", JSON.stringify(listDef, null, 2));
  //console.log(" Users:", allUsers);
}
main();
