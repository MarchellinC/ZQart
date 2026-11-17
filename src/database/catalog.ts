import type { SQLiteDatabase } from 'expo-sqlite';
import { categoryRepository, productRepository } from './index';
import { demoProducts } from '@/constants/demo-products';
import type { Product } from '@/types/product';

function categoryId(name: string) {
  return `category-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export async function ensureCatalogSeed(db: SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();
  const categories = [...new Set(demoProducts.map((item) => item.category))];
  for (const name of categories) {
    await categoryRepository.save(db, { id: categoryId(name), name, updated_at: now, sync_status: 'pending' });
  }
  const existing = await productRepository.list(db);
  for (const item of demoProducts) {
    if (existing.some((product) => product.id === item.id)) continue;
    await productRepository.save(db, {
      id: item.id, name: item.name, description: `${item.name}, karya lokal pilihan.`,
      price: item.price, image_url: null, category_id: categoryId(item.category),
      stock: 10, updated_at: now, sync_status: 'pending',
    });
  }
}

export async function loadCatalog(db: SQLiteDatabase): Promise<Product[]> {
  const [records, categories] = await Promise.all([
    productRepository.list(db), categoryRepository.list(db),
  ]);
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  return records.map((record) => {
    const demo = demoProducts.find((item) => item.id === record.id);
    return {
      ...demo, id: record.id, name: record.name, price: record.price,
      category: record.category_id ? categoryNames.get(record.category_id) ?? 'Lainnya' : 'Lainnya',
      rating: demo?.rating ?? 0, reviewCount: demo?.reviewCount ?? 0,
      emoji: demo?.emoji ?? '📦', artColor: demo?.artColor ?? '#EADCF3',
      badge: demo?.badge, description: record.description,
      image_url: record.image_url, stock: record.stock,
    };
  });
}
