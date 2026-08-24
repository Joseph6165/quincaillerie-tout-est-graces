const UNITS = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const TEENS = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function twoDigits(n: number): string {
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];

  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7 || ten === 9) {
    const base = TENS[ten];
    if (unit === 1) return `${base}-et-onze`;
    return `${base}-${TEENS[unit]}`;
  }

  if (unit === 0) return TENS[ten] + (ten === 8 ? "s" : "");
  if (unit === 1 && ten !== 8) return `${TENS[ten]}-et-un`;
  return `${TENS[ten]}-${UNITS[unit]}`;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let result = "";

  if (hundred > 0) {
    result += hundred === 1 ? "cent" : `${UNITS[hundred]} cent`;
    if (rest === 0 && hundred > 1) result += "s";
    if (rest > 0) result += " ";
  }
  if (rest > 0) result += twoDigits(rest);

  return result;
}

export function numberToFrenchWords(amount: number): string {
  if (amount === 0) return "zéro franc CFA";

  const n = Math.floor(amount);
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(`${billions === 1 ? "un" : threeDigits(billions)} milliard${billions > 1 ? "s" : ""}`);
  }
  if (millions > 0) {
    parts.push(`${millions === 1 ? "un" : threeDigits(millions)} million${millions > 1 ? "s" : ""}`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : `${threeDigits(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(threeDigits(remainder));
  }

  return `${parts.join(" ")} francs CFA`;
}