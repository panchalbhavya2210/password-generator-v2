"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, Download, X } from "lucide-react";
import { exportTableToExcel } from "@/app/lib/export-to-excel";

interface NetInvestmentColumnsProps<TData extends object> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
}

export default function NetInvestMentTable<TData extends object>({
  columns,
  data,
}: NetInvestmentColumnsProps<TData>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      sorting: [
        {
          id: "sector",
          desc: false,
        },
      ],
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const clearAll = () => {
    table.resetColumnFilters();
    table.resetSorting();
  };

  const isDirty =
    table.getState().columnFilters.length > 0 ||
    table.getState().sorting.length > 0;

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4 max-md:flex-wrap">
        {/* <Input
          placeholder="Search sector... (IT, Bank, Metal)"
          value={(table.getColumn("symbol")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("symbol")?.setFilterValue(event.target.value)
          }
        /> */}

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              variant="secondary"
              onClick={clearAll}
              className="flex items-center gap-2 max-md:max-w-max"
            >
              <X size={16} />
              Clear
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => exportTableToExcel(table, "industy-analytics")}
            className="flex items-center gap-2 max-md:max-w-max"
          >
            <Download size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      <Table className="table-fixed w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none relative"
                >
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      header.getResizeHandler()(e);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      header.getResizeHandler()(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                                  absolute right-0 top-0 h-full w-2 cursor-col-resize
                                  select-none touch-none
                                  bg-transparent hover:bg-primary
                                  ${header.column.getIsResizing() ? "bg-primary" : ""}
                                `}
                  >
                    <Separator className="w-2 h-full" orientation="vertical" />
                  </div>
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: <ArrowUpIcon size={15} />,
                      desc: <ArrowDownIcon size={15} />,
                    }[header.column.getIsSorted() as string] ?? ""}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              //   onClick={() => router.push(buildURI(row?.original?.index))}
              className="hover:bg-muted/40"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
