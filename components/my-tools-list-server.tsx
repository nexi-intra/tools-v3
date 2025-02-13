import prisma from "@/prisma";
import { MyToolList2 } from "./my-tool-list";

export async function MyToolListServer(props: { searchFor?: string; onLoaded?: () => void }) {


  return <div>

    {/* <MyToolList2 searchFor={props.searchFor} onLoaded={props.onLoaded} /> */}
  </div>
}