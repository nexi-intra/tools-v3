"use client";
import React, { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbItem,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import DevCurrentPage from "./dev-current-page";
import { Edit3Icon, LayersIcon } from "lucide-react";
import { DropdownMenuIcon } from "@radix-ui/react-icons";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BreadcrumbItemProps, useBreadcrumbContext } from "@/contexts/breadcrumb-context";

function GlobalBreadcrumbItem(props: {
  item: BreadcrumbItemProps;
  hasChilds: boolean;
  key: any;
  path: string;
}) {
  const [mouseover, setmouseover] = useState(false);
  const { item, hasChilds, key, path } = props;
  const breadcrumbContext = useBreadcrumbContext();
  const dropdown = breadcrumbContext.getDropdownHandler(path);
  const icon = mouseover ? (
    dropdown ? (
      <DropdownMenuIcon />
    ) : (
      <BreadcrumbSeparator />
    )
  ) : (
    <BreadcrumbSeparator />
  );

  return (
    <BreadcrumbItem
      key={key}
      onMouseEnter={() => setmouseover(true)}
      onMouseLeave={() => setmouseover(false)}
    >
      <BreadcrumbLink asChild>
        <Link href={item.href} prefetch={false}>
          {item.name}
        </Link>
      </BreadcrumbLink>

      {hasChilds && (
        <HoverCard openDelay={50} closeDelay={50}>
          <HoverCardTrigger asChild>{icon}</HoverCardTrigger>
          <HoverCardContent className="z-auto w-[80vw]" collisionPadding={50}>
            {dropdown}
          </HoverCardContent>
        </HoverCard>
      )}
    </BreadcrumbItem>
  );
}

export default function GlobalBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbContext = useBreadcrumbContext();
  const [showEdit, setshowEdit] = useState(false);

  useEffect(() => {
    breadcrumbContext.setPath(pathname);
  }, [pathname]);
  let root = "";
  return (
    <div
      className="flex"
      onMouseEnter={() => setshowEdit(true)}
      onMouseLeave={() => setshowEdit(false)}
    >
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbContext.items.map((item, i) => {
            root += "/" + item.name;
            return (
              <GlobalBreadcrumbItem
                path={root}
                key={i}
                item={item}
                hasChilds={i !== breadcrumbContext.items.length - 1}
              />
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {showEdit && (
        <DevCurrentPage>
          <div className="cursor-pointer ml-1 mt-[3px]">
            <Edit3Icon className="h-4 w-4 stroke-1 hover:stroke-2" />
          </div>
        </DevCurrentPage>
      )}
    </div>
  );
}
