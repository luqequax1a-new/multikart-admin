import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'priceTr', standalone: true })
export class PriceTrPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const n = typeof value === 'string' ? Number(value) : value;
    const v = isNaN(n) ? 0 : n;
    const txt = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
    return `${txt} ₺`; // sembol sonda
  }
}