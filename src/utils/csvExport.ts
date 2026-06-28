import { Product } from '../types';

export function exportProductsToCSV(products: Product[]) {
  if (!products || products.length === 0) {
    alert('No hay productos para exportar');
    return;
  }

  const headers = [
    'id',
    'title',
    'price',
    'originalPrice',
    'discount',
    'store',
    'category',
    'image',
    'rating',
    'reviewsCount',
    'url',
    'description',
    'featured',
  ];

  const rows = products.map((p) => {
    const values = headers.map((h) => {
      const val = (p as any)[h];
      if (typeof val === 'string') {
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return val !== undefined && val !== null ? val : '';
    });
    return values.join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  link.setAttribute('download', `productos_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
