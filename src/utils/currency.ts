const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiah.format(value).replace('IDR', 'Rp').replace(/\u00a0/g, ' ');
}
