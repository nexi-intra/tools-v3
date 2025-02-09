"use client";
//TODO: A little tender loving care
import { useState, useRef, useEffect, useMemo } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Delete, DeleteIcon, Pin, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
type TabItem = {
  id: string;
  title: string;
  href: string;
};

const DraggableTab = ({
  tab,
  isActive,
  onClick,
  onRemove,
  isCurrentPage,
}: {
  tab: TabItem;
  isActive: boolean;
  isCurrentPage: boolean;
  onClick: () => void;
  onRemove: (key: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Button
      variant={isCurrentPage ? "default" : "outline"}
      ref={setNodeRef}
      onClick={onClick}
      style={style}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${isActive ? "bg-background text-foreground shadow-sm" : ""
        }`}
      {...attributes}
    >
      <GripVertical className="mr-2 h-4 w-4 cursor-move" {...listeners} />
      {tab.title}
      <X
        className="ml-2 h-3 w-3"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tab.id);
        }}
      />
    </Button>
  );
};

interface SavedPage {
  pathname: string;
  title: any;
}

export default function TabNavigatorWithReorder() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("tab1");

  const [version, setversion] = useState(0);
  const [tabData, setTabData] = useState<TabItem[]>([]);
  const [draggedTab, setDraggedTab] = useState<TabItem | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [isCurrentPageInTab, setisCurrentPageInTab] = useState(false);
  useEffect(() => {
    setisCurrentPageInTab(
      tabData.find((path) => path.title === pathname) ? true : false
    );
  }, [pathname, tabData]);

  useEffect(() => {
    const storedPaths = sessionStorage.getItem("paths");
    if (storedPaths) {
      let stored = JSON.parse(storedPaths);
      let tabs = stored.map((path: SavedPage, key: number) => {
        let tab: TabItem = {
          id: key.toString(),
          title: path.title,
          href: path.pathname,
        };
        return tab;
      });
      setTabData(tabs);
    }
  }, []);

  useEffect(() => {
    if (tabData.find((path) => path.title === pathname)) {
      setActiveTab(pathname);
    }
  }, [pathname, version]);

  useEffect(() => {
    if (version > 0) {
      let pages = tabData.map((tab) => {
        return { pathname: tab.href, title: tab.title };
      });
      sessionStorage.setItem("paths", JSON.stringify(pages));
    }
  }, [version]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement =
        tabsRef.current.querySelector(`[data-active="true"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedTab(tabData.find((tab) => tab.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTabData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
      setversion(version + 1);
    }

    setDraggedTab(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full mx-auto">
        <div className="relative">
          <ScrollArea className="w-full">
            <div
              ref={tabsRef}
              className="inline-flex h-10 items-center justify-start rounded-md  p-1 text-muted-foreground"
            >
              <SortableContext
                items={tabData}
                strategy={horizontalListSortingStrategy}
              >
                {tabData.map((tab) => (
                  <DraggableTab
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    isCurrentPage={pathname === tab.title}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.push(tab.href);
                    }}
                    onRemove={(key) => {
                      setTabData(tabData.filter((tab) => tab.id !== key));

                      setversion(version + 1);
                    }}
                  />
                ))}
              </SortableContext>
              {!isCurrentPageInTab && (
                <span

                  onClick={() => {
                    tabData.push({
                      id: tabData.length.toString(),
                      title: pathname,
                      href: pathname,
                    });
                    setTabData(tabData);
                    setisCurrentPageInTab(true);

                    setversion(version + 1);
                  }}
                >
                  <Pin className="h-5 w-5" />
                </span>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {/* <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-0 bottom-0 bg-background"
            onClick={() =>
              tabsRef.current?.scrollBy({ left: -100, behavior: "smooth" })
            }
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-0 bottom-0 bg-background"
            onClick={() =>
              tabsRef.current?.scrollBy({ left: 100, behavior: "smooth" })
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button> */}
        </div>
      </div>
      <DragOverlay>
        {draggedTab ? (
          <Button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all">
            <GripVertical className="mr-2 h-4 w-4" />
            {draggedTab.title}
          </Button>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
