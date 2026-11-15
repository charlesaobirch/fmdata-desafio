/*
 * Formatação à mão em vez de Intl: o resultado é igual no servidor e
 * no browser (versões de ICU diferentes dariam erros de hidratação).
 */

/** 4345 -> "4 345" (espaço inquebrável a separar milhares, como em pt-PT). */
export function formatarNumero(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * 3.0415 -> "3,04"; 56.485 -> "56,49" (para tabelas com a unidade no cabeçalho).
 * Em vírgula flutuante 56.485 é 56.48499…, e toFixed arredondaria
 * para baixo; limpar o ruído dos cêntimos antes de arredondar
 * corrige o meio cêntimo.
 */
export function formatarValor(n: number): string {
  const centimos = Math.round(Number((n * 100).toPrecision(12)));
  const [inteiro, decimal] = (centimos / 100).toFixed(2).split(".");
  return `${formatarNumero(Number(inteiro))},${decimal}`;
}

/** 3.0415 -> "3,04 USD" */
export function formatarUSD(n: number): string {
  return `${formatarValor(n)} USD`;
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
