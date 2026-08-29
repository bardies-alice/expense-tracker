export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniqueSlug(name: string, exists: (slug: string) => Promise<boolean>) {
  const base = slugify(name) || "item";
  let slug = base;
  let n = 2;
  while (await exists(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}
