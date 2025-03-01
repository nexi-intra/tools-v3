"use client"
import React, { useEffect, useState } from 'react'
import { GenericTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { GenericItem } from '@/components/table/data/schema';
import { DataTableColumnHeader } from '@/components/table/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
export function TableOfBoards({ boards }: { boards: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const [items, setitems] = useState([])
  useEffect(() => {
    if (boards) {
      setitems(boards)
    }
  }, [boards])

  const col1: ColumnDef<GenericItem<any>> = {
    id: "string1",
    accessorKey: "string1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" />
    ),
    cell: ({ row }) => (
      <div>
        <Button

          onClick={() => {
            alert("hej")
          }}
        >
          Manage
        </Button>
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  };
  const col2: ColumnDef<GenericItem<any>> = {
    id: "string2",
    accessorKey: "string2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" />
    ),
    cell: ({ row }) => (
      <div>
        <Button

          onClick={() => {
            router.push(pathname + "/" + row.original.title)
          }}
        >
          View accounts
        </Button>
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  };

  return (
    <GenericTable data={items} addtionalColumns={[col1, col2]}
      actions={{
        filterComponent: (params) => {
          if (params) {
            let x = 1;
          }
          return (
            <div className="flex w-max space-x-4 hidden">

              <div className="grow">&nbsp;</div>
              <Button
                variant={"secondary"}
                onClick={() => {

                }}
              >
                Clear
              </Button>
            </div>
          );
        },
        selectedItemsActionsComponent: (params) => {
          return (
            <div>
              {/* <Button variant="destructive"> Delete</Button> */}
              {params.rows.length === 1 && <Button>Manage</Button>}

              {params.rows.length > 1 && (
                <Button
                  onClick={() => {
                    const items = params.rows.map((r) => {
                      return r.original;
                    });
                  }}
                >
                  Actions
                </Button>
              )}
            </div>
          );
        },
      }}


    />
  )
}
