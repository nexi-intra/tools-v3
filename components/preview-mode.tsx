import type { ColumnType, RowType, CellContentType } from "@/components/tile-organizer"
import { Tile } from "@/components/tile"

interface PreviewModeProps {
  columns: ColumnType[]
  rows: RowType[]
  cellContents: CellContentType[]
}

export function PreviewMode({ columns, rows, cellContents }: PreviewModeProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-40"></th>
            {columns.map((column) => (
              <th key={column.id} className="w-40 p-2 font-semibold text-center">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="p-2 font-semibold">{row.title}</td>
              {columns.map((column) => {
                const cell = cellContents.find((c) => c.columnId === column.id && c.rowId === row.id)
                return (
                  <td key={`${row.id}-${column.id}`} className="p-2">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {cell?.tiles.map((tile) => (
                        <Tile key={tile.id} tile={tile} />
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

