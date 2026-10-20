// Minimal CSV parser for prospect import (FR-02). Handles quoted fields,
// embedded commas, escaped quotes, and CRLF/LF line endings.

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows = parseRows(text.trim());
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const out: CsvRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    if (cells.length === 1 && cells[0].trim() === "") continue;
    const row: CsvRow = {};
    header.forEach((key, idx) => {
      row[key] = (cells[idx] ?? "").trim();
    });
    out.push(row);
  }
  return out;
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip, handled by \n
      } else {
        field += c;
      }
    }
  }
  // last field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
