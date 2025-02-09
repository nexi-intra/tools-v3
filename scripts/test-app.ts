import { ToolsApp } from "@/internal/tools-app";
import { ToolSpokeSite } from "@/internal/toolspokesite";

async function main() {
  const app = new ToolsApp();

  await app.syncronizeAll({ force: true });
  await app.syncUserProfiles({ createOnly: true, force: false });
}
main();
console.log("done");
