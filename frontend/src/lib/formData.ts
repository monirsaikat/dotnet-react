export function getString(data: FormData, field: string): string {
  return String(data.get(field) ?? "").trim();
}

export function getNumber(data: FormData, field: string): number {
  return Number(data.get(field));
}

export function isChecked(data: FormData, field: string): boolean {
  return data.get(field) === "on";
}
