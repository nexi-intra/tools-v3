"use client"
import React, { useContext, useEffect, useState } from 'react'
import { GenericTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { GenericItem } from '@/components/table/data/schema';
import { DataTableColumnHeader } from '@/components/table/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { actionBoardSaveCopy } from '@/actions/board-actions';
import { MagicboxContext } from '@/contexts/magicbox-context';
import { useToast } from '@/hooks/use-toast';
export function TableOfBoards({ boards }: { boards: any }) {
  const magicbox = useContext(MagicboxContext)
  const router = useRouter()
  const pathname = usePathname()
  const [items, setitems] = useState([])
  const [error, seterror] = useState("")
  const { toast } = useToast()
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
          variant={"link"}
          onClick={() => {
            router.push(pathname + "/" + row.original.id)
          }}
        >
          Edit
        </Button>
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  };

  return (
    <GenericTable data={items} addtionalColumns={[col2]}
      actions={{
        filterComponent: (params) => {
          if (params) {
            let x = 1;
          }
          return (
            <div className="flex w-max space-x-4 ">

              <div className="grow">&nbsp;</div>
              <Button
                variant={"secondary"}
                onClick={async () => {
                  seterror("")
                  const saveResult = await actionBoardSaveCopy("New " + magicbox.user?.name, "{}")
                  if (!saveResult.saved || !saveResult.id) {
                    seterror("Failed to save: " + saveResult?.error)
                    return
                  }
                  toast({

                    description: "Opening",

                  })

                  router.push(pathname + "/" + saveResult.id.toString())

                }}
              >
                New Board
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
