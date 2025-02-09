import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
prisma.tool.findMany().then((tools) => {
  tools.forEach((tool) => {
    console.log(tool.name);
  });
});

// const userData: Prisma.UserCreateInput[] = [
//   {
//     name: "Alice",
//     email: "alice@prisma.io",
//     posts: {
//       create: [
//         {
//           title: "Join the Prisma Discord",

//           published: true,
//         },
//         {
//           title: "Prisma on YouTube",
//         },
//       ],
//     },
//   },
//   {
//     name: "Bob",
//     email: "bob@prisma.io",
//     posts: {
//       create: [
//         {
//           title: "Follow Prisma on Twitter",

//           published: true,
//         },
//       ],
//     },
//   },
// ];

// export async function main() {
//   for (const u of userData) {
//     await prisma.user.create({ data: u });
//   }
// }

// main();
