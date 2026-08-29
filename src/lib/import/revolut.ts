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
  guessedSubcategoryName: string | null;
}

const INTERNAL_TRANSFER_PATTERN = /fondos monetarios flexibles|retirada del pocket|al pocket|closing transaction/i;

/**
 * Checked first: merchant patterns specific enough to imply both a category
 * and one of its existing subcategories (e.g. Netflix -> Ocio/Suscripciones).
 */
const SUBCATEGORY_RULES: { categorySlug: string; subcategoryName: string; pattern: RegExp }[] = [
  {
    categorySlug: "ocio",
    subcategoryName: "Suscripciones",
    pattern: /netflix|spotify|\bhbo\b|disney\+?|\bsteam\b|playstation|\bapple\b|\bclaude\b|\bcursor\b|microsoft store|basic-?fit|gimnasio/i,
  },
  { categorySlug: "comida", subcategoryName: "Delivery", pattern: /glovo|uber eats|just eat/i },
  {
    categorySlug: "comida",
    subcategoryName: "Supermercado",
    pattern: /carrefour|mercadona|lidl|d[ií]a %|alcampo|eroski|bm supermercados|supermercado|alimentacion|mini ?market/i,
  },
  { categorySlug: "coche", subcategoryName: "Combustible", pattern: /cepsa|repsol|\bshell\b|\bbp\b|galp|gas lac|plenergy|gasolinera/i },
  { categorySlug: "coche", subcategoryName: "ITV", pattern: /\bitv\b/i },
  {
    categorySlug: "casa",
    subcategoryName: "Suministros",
    pattern: /iberdrola|endesa|naturgy|\bdigi\b|movistar|vodafone|\borange\b|telecom|\bagua\b|gas natural/i,
  },
  { categorySlug: "viajes", subcategoryName: "Alojamiento", pattern: /booking|airbnb|hotel/i },
  { categorySlug: "viajes", subcategoryName: "Transporte", pattern: /ryanair|vueling|iberia|renfe|omio|ouigo|kiwi\.com/i },
];

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  comida:
    /carrefour|mercadona|lidl|d[ií]a %|alcampo|eroski|restaurante|\bbar\b|cafe|cafeter[ií]a|asador|pizzer[ií]a|pizza|kebab|sushi|glovo|uber eats|just eat|panader[ií]a|pasteler[ií]a|hamburgues|mcdonald|burger king|\bkfc\b|taco bell|helader[ií]a|gelato|marisqueria|freiduria|ristorante|trattoria|\btapa|bagueteria|izakaya|supermercado|alimentacion|mini ?market|kiosko|z[aá]bka|žabka|colvin|bm supermercados|starbucks|tabern|bodega|mes[oó]n\b/i,
  coche: /cepsa|repsol|\bshell\b|\bbp\b|galp|gasolinera|parking|\bitv\b|taller|neum[aá]tico|autopista|\bcabify\b|\buber\b(?! eats)|\btaxi\b|gas lac|norauto|plenergy/i,
  casa: /allianz|mapfre|mutua|endesa|iberdrola|naturgy|comunidad|alquiler|hipoteca|\bagua\b|gas natural|leroy merlin|\bikea\b|obramat|\bdigi\b|movistar|vodafone|\borange\b|telecom/i,
  ocio:
    /netflix|spotify|\bhbo\b|disney|steam|playstation|\bcine\b|multicines|odeon|cinesa|bershka|\bzara\b|primark|amazon|temu|aliexpress|corte ingl[eé]s|\bapple\b|\bclaude\b|\bcursor\b|peluqueria|basic-?fit|gimnasio|pull ?& ?bear|stradivarius|\bwallapop\b|\bebay\b|back market|kinguin|toysplanet|pc componentes|microsoft store|flying tiger|\bdecathlon\b|zeeman|estanco|tabacos|jd sports|\bprimor\b/i,
  viajes: /booking|ryanair|vueling|iberia|renfe|omio|airbnb|hotel|ouigo|kiwi\.com/i,
};

export function normalizeMerchant(descripcion: string): string {
  return descripcion.trim().toLowerCase();
}

function guessCategory(descripcion: string): { categorySlug: string | null; subcategoryName: string | null } {
  for (const rule of SUBCATEGORY_RULES) {
    if (rule.pattern.test(descripcion)) return { categorySlug: rule.categorySlug, subcategoryName: rule.subcategoryName };
  }
  for (const [slug, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
    if (pattern.test(descripcion)) return { categorySlug: slug, subcategoryName: null };
  }
  return { categorySlug: null, subcategoryName: null };
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
    const guess = internal ? { categorySlug: null, subcategoryName: null } : guessCategory(descripcion);

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
      guessedCategorySlug: guess.categorySlug,
      guessedSubcategoryName: guess.subcategoryName,
    };
  });
}
