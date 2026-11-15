/*
 * Formatação à mão em vez de Intl: o resultado é igual no servidor e
 * no browser (versões de ICU diferentes dariam erros de hidratação).
 */

/** 4345 -> "4 345" (espaço inquebrável a separar milhares, como em pt-PT). */
export function formatarNumero(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** 3.0415 -> "3,04 USD" */
export function formatarUSD(n: number): string {
  const [inteiro, decimal] = n.toFixed(2).split(".");
  return `${formatarNumero(Number(inteiro))},${decimal} USD`;
}

/** 0.0007 -> "0,0007" (taxas por reprodução, sem arredondar) */
export function formatarTaxa(taxa: number): string {
  return String(taxa).replace(".", ",");
}

/** índice 1.32 -> "+32%"; 0.74 -> "−26%" (face ao habitual) */
export function formatarIndice(indice: number): string {
  const p = Math.round((indice - 1) * 100);
  return p >= 0 ? `+${p}%` : `−${Math.abs(p)}%`;
}
