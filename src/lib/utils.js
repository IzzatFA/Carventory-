export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const categoryLabel = {
  penumpang: 'Penumpang',
  mewah: 'Mewah',
  klasik: 'Klasik',
};

export const categoryColors = {
  penumpang: '#3B82F6',
  mewah: '#8B5CF6',
  klasik: '#D97706',
};
