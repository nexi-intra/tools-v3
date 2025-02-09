import { UserGraphClient } from "@/internal/userprofiles";

async function main() {
  const tenantId = process.env.APP_TENANT_ID!;
  const clientId = process.env.APP_CLIENT_ID!;
  const clientSecret = process.env.APP_CLIENT_SECRET!;

  const userGraphClient = new UserGraphClient(tenantId, clientId, clientSecret);

  const users = await userGraphClient.getUsers();
  console.log("Users:", users);

  console.log("Users read,", users.length, " users");
  process.exit(0);

  //console.log(" Users:", allUsers);
}
main();
