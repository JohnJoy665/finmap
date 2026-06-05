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

export function fromMinorToMajorNormalize(
  amount: string,
  conversionFactor: number,
  locale = navigator.language
): string {
  const minorAmount = Number(amount);
  const majorAmount = minorAmount / conversionFactor;

  const fractionLength = String(conversionFactor).length - 1;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionLength,
    maximumFractionDigits: fractionLength,
  }).format(majorAmount);
}

export function fromMinorToMajorFormated(
  amount: string,
  conversionFactor: number,
  locale = navigator.language
): string {
  const minorAmount = Number(amount);
  const majorAmount = minorAmount / conversionFactor;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  if (majorAmount < 1_000_000) {
    const value = Math.trunc((majorAmount / 1_000) * 10) / 10;

    return `${formatter.format(value)}K`;
  }

  const value = Math.trunc((majorAmount / 1_000_000) * 10) / 10;

  return `${formatter.format(value)}M`;
}
