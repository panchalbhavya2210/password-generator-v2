import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export function exportTableToExcel(table: any, fileName: string) {
  const rows = table.getRowModel().rows;
  if (!rows.length) return;

  const columns = table.getAllLeafColumns();

  // ---------- CREATE DATA ----------
  const data: any[][] = [];

  // headers
  const headerRow = columns.map((col: any) =>
    typeof col.columnDef.header === "string" ? col.columnDef.header : col.id,
  );
  data.push(headerRow);

  // rows
  rows.forEach((row: any) => {
    const rowArr: any[] = [];

    row.getVisibleCells().forEach((cell: any) => {
      rowArr.push(cell.getValue());
    });

    data.push(rowArr);
  });

  // ---------- WORKSHEET ----------
  const ws = XLSX.utils.aoa_to_sheet(data);

  // ---------- HEADER STYLE ----------
  columns.forEach((_: any, colIndex: number) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });

    ws[cellRef].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "1E293B" }, // dark slate
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };
  });

  // ---------- VALUE COLORS (GREEN / RED) ----------
  for (let r = 1; r < data.length; r++) {
    for (let c = 1; c < columns.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) continue;

      const value = Number(cell.v);

      if (!isNaN(value)) {
        if (value > 0) {
          cell.s = {
            font: {
              color: { rgb: "15803D" }, // green
              bold: true,
            },
          };
        } else if (value < 0) {
          cell.s = {
            font: {
              color: { rgb: "DC2626" }, // red
              bold: true,
            },
          };
        }
      }
    }
  }

  // ---------- COLUMN WIDTH ----------
  ws["!cols"] = columns.map(() => ({ wch: 14 }));

  // ---------- WORKBOOK ----------
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sector Data");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}.xlsx`,
  );
}
