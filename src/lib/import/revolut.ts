export interface RawImportRow {
  tipo: string;
  producto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  importe: number;
  divisa: string;
  estado: string;
}

export interface ParsedImportRow extends RawImportRow {
  externalRef: string;
  internal: boolean;
  type: "EXPENSE" | "INCOME";
  guessedCategorySlug: string | null;
}

const INTERNAL_TRANSFER_PATTERN = /fondos monetarios flexibles|retirada del pocket|al pocket|closing transaction/i;

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  comida: /carrefour|mercadona|lidl|d[ií]a %|alcampo|eroski|restaurante|\bbar\b|cafe|cafeter[ií]a|asador|pizzer[ií]a|kebab|sushi|glovo|uber eats|just eat|panader[ií]a|pasteler[ií]a|hamburgues/i,
  coche: /cepsa|repsol|\bshell\b|\bbp\b|galp|gasolinera|parking|\bitv\b|taller|neum[aá]tico/i,
  casa: /allianz|mapfre|mutua|endesa|iberdrola|naturgy|comunidad|alquiler|hipoteca|agua|gas natural/i,
  ocio: /netflix|spotify|\bhbo\b|disney|steam|playstation|\bcine\b|bershka|\bzara\b|primark|amazon|temu|aliexpress|corte ingl[eé]s/i,
  viajes: /booking|ryanair|vueling|iberia|renfe|omio|airbnb|hotel/i,
};

function guessCategorySlug(descripcion: string): string | null {
  for (const [slug, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
    if (pattern.test(descripcion)) return slug;
  }
  return null;
}

/** Minimal RFC4180 CSV parser: handles quoted fields with embedded commas/quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v.length > 0)) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((v) => v.length > 0)) rows.push(row);
  }
  return rows;
}

export function parseRevolutCsv(text: string): ParsedImportRow[] {
  const rows = parseCsv(text);
  const [, ...dataRows] = rows;

  return dataRows.map((cols) => {
    const [tipo, producto, fechaInicio, fechaFin, descripcion, importeStr, , divisa, estado] = cols;
    const importe = Number(importeStr);
    const internal = tipo === "Cambio" || INTERNAL_TRANSFER_PATTERN.test(descripcion) || importe === 0;
    const externalRef = `revolut:${fechaInicio}:${importeStr}:${descripcion}`;

    return {
      tipo,
      producto,
      fechaInicio,
      fechaFin,
      descripcion,
      importe,
      divisa,
      estado,
      externalRef,
      internal,
      type: importe < 0 ? "EXPENSE" : "INCOME",
      guessedCategorySlug: internal ? null : guessCategorySlug(descripcion),
    };
  });
}
