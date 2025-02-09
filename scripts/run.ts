// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
  debug: false,
});
// runner.ts
import { exec } from "child_process";
import fs from "fs";

const command: string = process.argv[2];

if (!command) {
  console.error("Please provide a command name.");
  process.exit(1);
}

const scriptPath = `./scripts/${command}.${
  command === "send-emails" ? "tsx" : "ts"
}`;

if (!fs.existsSync(scriptPath)) {
  console.error(`The script ${scriptPath} does not exist.`);
  process.exit(2);
}
let running = true;
// const cmd = `npx tsx  --stack-size=5120000 ${scriptPath}`;
// console.log("Running command", cmd);

exec(
  `npx tsx  --stack-size=5120000 ${scriptPath}`,
  { maxBuffer: 1024 * 5000 },
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      process.exit((error as any).code || 1);
    }
    running = false;
    process.exit(0);
  }
);
