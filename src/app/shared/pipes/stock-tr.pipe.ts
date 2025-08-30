import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stockTr', standalone: true })
export class StockTrPipe implements PipeTransform {
  transform(
    qty: number | string | null | undefined,
    step?: number | string | null,
    unitText?: string | null
  ): string {
    if (qty === null || qty === undefined || qty === '') return '—';

    const q = typeof qty === 'string' ? Number(qty) : qty;
    const s = step == null ? null : (typeof step === 'string' ? Number(step) : step);

    let out: string;
    if (s === 1) {
      // tam sayılı birim
      out = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(q));
    } else {
      // en çok 2 ondalık, gereksiz .00 yok
      const rounded = Math.round(q * 100) / 100;
      out = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(rounded);
    }
    return unitText ? `${out} ${unitText}` : out;
  }
}