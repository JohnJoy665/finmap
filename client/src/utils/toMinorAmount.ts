export function toMinorUnits(amount: string, conversionFactor: number): string {
  const normalized = amount.replace(",", ".").trim();

  const [wholePart = "0", fractionPart = ""] = normalized.split(".");

  const fractionDigits = String(conversionFactor).length - 1;

  const paddedFraction = fractionPart
    .padEnd(fractionDigits, "0")
    .slice(0, fractionDigits);

  const result =
    BigInt(wholePart || "0") * BigInt(conversionFactor) +
    BigInt(paddedFraction || "0");

  return result.toString();
}

export function fromMinorUnits(
  amount: string,
  conversionFactor: number
): number {
  return Number(amount) / conversionFactor;
}

export function formatMoney(
  amount: string,
  conversionFactor: number,
  locale = navigator.language
): string {
  const value = Number(amount) / conversionFactor;
  const fractionLength = String(conversionFactor).length - 1;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionLength,
    maximumFractionDigits: fractionLength,
  }).format(value);
}
