import prisma from "@/prisma";
import { ToolsApp } from "./tools-app";
import { UserGraphClient } from "./userprofiles";
import pLimit from "p-limit";

export async function syncUserProfiles(
  app: ToolsApp,
  userGraphClient: UserGraphClient,
  options: { force: boolean; createOnly: boolean } = {
    force: false,
    createOnly: false,
  }
) {
  app.log.info("User sync:");

  // Retrieve the current database records
  const db = await prisma.userProfile.findMany({
    select: {
      id: true,
      koksmat_masterdataref: true,
      koksmat_masterdata_etag: true,
      koksmat_masterdata_id: true,
    },
  });

  app.log.highlight(`Users   number of records ${db.length}`);
  if (options.force) {
    app.log.highlight("Force option enabled, all records will be updated");
  }
  if (options.createOnly) {
    app.log.highlight("Only new records will be created");
  }
  // Get the list of users from the graph client
  const items = await userGraphClient.getUsers();
  let created = 0;
  let updated = 0;
  let deleted = 0;

  // Create a concurrency limiter that only allows 20 promises to run at once.
  const limit = pLimit(20);

  // Wrap each task with the limiter.
  const tasks = items.map((graphUser) =>
    limit(async () => {
      const dbItem = db.find(
        (item) => item.koksmat_masterdata_id === graphUser.userPrincipalName
      );
      if (dbItem) {
        if (options.createOnly) return;
        // --------------------------------------------------------------------------------
        // Updating
        // --------------------------------------------------------------------------------
        app.log.highlight(
          `User : ${graphUser.userPrincipalName}`,
          dbItem.id,
          "Updating item"
        );
        try {
          graphUser.displayName = graphUser.displayName.replaceAll(
            "\u0000",
            ""
          );
          const updatedRecord = await prisma.userProfile.update({
            where: {
              id: dbItem.id,
            },
            data: {
              name: graphUser.userPrincipalName,
              displayName: graphUser.displayName,
              updated_by: "system",
              updated_at: new Date(),
              CurrentEmail:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute6,
              OldEmail:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute9,
              OnPremisesId:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute11,
              email: graphUser.userPrincipalName,
              company: graphUser.Companyname,
              companykey:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute4,
              country: graphUser.Country ? graphUser.Country : "Unknown",
              isExternal:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute4?.endsWith(
                  "E"
                ) ?? false,
            },
          });
          app.log.info("Updated", updatedRecord.id);
          await app.writeSyncLogInfo("update", {
            graphUser,
            updatedRecord,
          });

          updated++;
        } catch (error) {
          app.log.error("Syncronising Users", (error as Error).message);
          await app.writeSyncLogError(
            "update",
            { sharePointItem: graphUser },
            error as Error
          );
        }
      } else {
        // --------------------------------------------------------------------------------
        // Creating
        // --------------------------------------------------------------------------------
        app.log.highlight(graphUser.userPrincipalName, "New item");
        try {
          graphUser.displayName = graphUser.displayName.replaceAll(
            "\u0000",
            ""
          );
          const newRecord = await prisma.userProfile.create({
            data: {
              created_at: new Date(),
              created_by: "system",
              updated_at: new Date(),
              updated_by: "system",
              koksmat_masterdata_id: graphUser.userPrincipalName,
              name: graphUser.userPrincipalName,
              displayName: graphUser.displayName.replaceAll("\u0000", ""),
              CurrentEmail:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute6,
              OldEmail:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute9,
              OnPremisesId:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute11,
              email: graphUser.userPrincipalName,
              company: graphUser.Companyname,
              companykey:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute4,
              country: graphUser.Country ? graphUser.Country : "Unknown",
              isExternal:
                graphUser.onPremisesExtensionAttributes?.extensionAttribute4?.endsWith(
                  "E"
                ) ?? false,
            },
          });
          await app.writeSyncLogInfo("create", {
            graphUser,
            newRecord,
          });

          created++;
          app.log.info("Created", newRecord.id);
        } catch (error) {
          app.log.error(
            "Syncronising User ",
            graphUser.userPrincipalName,
            " see log for details"
          );
          await app.writeSyncLogError(
            "create",
            { sharePointItem: graphUser },
            error as Error
          );
        }
      }
    })
  );

  // Wait until all the limited tasks are complete
  await Promise.all(tasks);

  // Any code here will execute only after all the above asynchronous operations have completed.

  app.log.highlight(
    `Database Tools Sync done: ${created} created, ${updated} updated, ${deleted} deleted - ${await prisma.userProfile.count()} total profiles`
  );
}
