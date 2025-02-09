import prisma from "@/prisma";
import { MyToolList2 } from "./my-tool-list";

export async function MyToolListServer(props: { searchFor?: string; onLoaded?: () => void }) {
  const tools = (await prisma.tool.findMany({
    where: {
      // name: {
      //   contains: props.query,
      //   mode: "insensitive"
      // }
    }

  })).sort((a, b) => a.name.localeCompare(b.name));

  return <div>server
    {/* <MyToolList2 searchFor={props.searchFor} onLoaded={props.onLoaded} /> */}
  </div>
}