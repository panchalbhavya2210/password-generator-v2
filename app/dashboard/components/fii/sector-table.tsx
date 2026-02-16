"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
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

import { useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTableToExcel } from "@/app/lib/export-to-excel";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function SectorTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  console.log(data);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const arrowUpIcon = <ArrowUp size={20} />;
  const arrowDownIcon = <ArrowDown size={20} />;

  const clearAll = () => {
    // clear search filter
    table.resetColumnFilters();

    // clear sorting
    table.resetSorting();

    // optional: also clear global filter if you add later
    table.resetGlobalFilter?.();
  };
  const isDirty =
    table.getState().columnFilters.length > 0 ||
    table.getState().sorting.length > 0;

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4 max-md:flex-wrap">
        <Input
          placeholder="Search sector... (IT, Bank, Metal)"
          value={(table.getColumn("Sector")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Sector")?.setFilterValue(event.target.value)
          }
          className="max-w-sm max-md:w-full"
        />

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
            onClick={() => exportTableToExcel(table, "sector-performance")}
            className="flex items-center gap-2 max-md:max-w-max"
          >
            <Download size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: arrowUpIcon,
                      desc: arrowDownIcon,
                    }[header.column.getIsSorted() as string] ?? ""}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/40">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
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
