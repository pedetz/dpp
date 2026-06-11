export interface Country {
  code: string;
  name_it: string;
}

export const countries: Country[] = [
  { code: "IT", name_it: "Italia" },
  { code: "FR", name_it: "Francia" },
  { code: "DE", name_it: "Germania" },
  { code: "ES", name_it: "Spagna" },
  { code: "PT", name_it: "Portogallo" },
  { code: "GR", name_it: "Grecia" },
  { code: "TR", name_it: "Turchia" },
  { code: "TN", name_it: "Tunisia" },
  { code: "MA", name_it: "Marocco" },
  { code: "RO", name_it: "Romania" },
  { code: "BG", name_it: "Bulgaria" },
  { code: "PL", name_it: "Polonia" },
  { code: "CN", name_it: "Cina" },
  { code: "IN", name_it: "India" },
  { code: "BD", name_it: "Bangladesh" },
  { code: "VN", name_it: "Vietnam" },
  { code: "PK", name_it: "Pakistan" },
  { code: "GB", name_it: "Regno Unito" },
  { code: "US", name_it: "Stati Uniti" },
  { code: "JP", name_it: "Giappone" },
];

export function countryName(code: string): string {
  return countries.find((c) => c.code === code)?.name_it ?? code;
}
