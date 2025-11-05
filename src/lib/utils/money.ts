export const formatCurrencyIDR = (amount: number): string => {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    // Fallback jika Intl tidak tersedia
    const n = Math.floor(Number(amount || 0));
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
};

export const formatEventPrice = (opts: { is_free?: boolean; price?: number | null } | null | undefined): string => {
  const isFree = !!opts?.is_free || Number(opts?.price || 0) === 0;
  if (isFree) return 'Gratis';
  return formatCurrencyIDR(Number(opts?.price || 0));
};