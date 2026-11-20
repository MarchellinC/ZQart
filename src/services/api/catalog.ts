import { categoryRepository, productRepository } from '@/database';
import type { SQLiteDatabase } from 'expo-sqlite';

type PublicProduct = {
  id: number; title: string; description: string; price: number; category: string;
  rating?: number; stock?: number; thumbnail?: string; images?: string[];
};
type ProductResponse = { products?: PublicProduct[] };
type ExchangeResponse = { result?: string; rates?: Record<string, number> };

const CATALOG_URL = 'https://dummyjson.com/products?limit=30&select=id,title,description,price,category,rating,stock,thumbnail,images';
const USD_RATE_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_USD_IDR = 16000;

function toCategoryId(category: string): string {
  const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `api-category-${slug || 'other'}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API merespons HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

export async function refreshPublicCatalog(db: SQLiteDatabase): Promise<number> {
  const [catalogResponse, exchangeResponse] = await Promise.all([
    fetchJson<ProductResponse>(CATALOG_URL),
    fetchJson<ExchangeResponse>(USD_RATE_URL).catch(() => null),
  ]);
  if (!Array.isArray(catalogResponse.products)) throw new Error('Format katalog API tidak sesuai.');
  const idrRate = exchangeResponse?.rates?.IDR;
  const rate = exchangeResponse?.result === 'success' && typeof idrRate === 'number' && Number.isFinite(idrRate)
    ? idrRate : FALLBACK_USD_IDR;
  const now = new Date().toISOString();
  for (const product of catalogResponse.products) {
    const name = product.category?.trim() || 'Lainnya';
    const id = toCategoryId(name);
    await categoryRepository.save(db, { id, name, updated_at: now, sync_status: 'synced' });
  }
  for (const product of catalogResponse.products) {
    const categoryId = toCategoryId(product.category?.trim() || 'Lainnya');
    const image = product.thumbnail || product.images?.[0] || null;
    await productRepository.save(db, {
      id: `api-dummyjson-${product.id}`,
      name: product.title.trim(),
      description: product.description.trim(),
      price: Math.max(0, Math.round(product.price * rate)),
      image_url: image,
      category_id: categoryId,
      stock: Math.max(0, Math.floor(product.stock ?? 0)),
      updated_at: now,
      sync_status: 'synced',
    });
  }
  return catalogResponse.products.length;
}

export function publicCatalogApiDescription(): string {
  return 'DummyJSON menyediakan data contoh produk; harga USD dikonversi ke IDR menggunakan kurs publik, dengan fallback kurs simulasi saat API kurs tidak tersedia.';
}
