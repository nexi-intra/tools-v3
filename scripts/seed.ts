import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
  prisma.tool.findMany().then((tools) => {
    tools
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((tool) => {
        console.log(tool.name);
      });
  });
}

main();
