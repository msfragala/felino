export function plural(singular: string, plural: string, number: number) {
  return number === 1 ? singular : plural;
}
