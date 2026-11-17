import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { initializeDatabase, buyerDataRepository } from '@/database';
import { ensureCatalogSeed, loadCatalog } from '@/database/catalog';
import { useAuth } from './auth-context';
import type { Product } from '@/types/product';

export type DemoCartItem = { productId: string; quantity: number };
type DemoStoreValue = {
  products: Product[]; favoriteIds: string[]; cartItems: DemoCartItem[];
  refreshProducts: () => Promise<void>; toggleFavorite: (id: string) => void;
  addToCart: (id: string) => void; setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
};
const DemoStore = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<DemoCartItem[]>([]);
  const refreshProducts = async () => {
    const db = await initializeDatabase();
    await ensureCatalogSeed(db);
    setProducts(await loadCatalog(db));
  };
  useEffect(() => {
    let active = true;
    void (async () => {
      const db = await initializeDatabase();
      await ensureCatalogSeed(db);
      const catalog = await loadCatalog(db);
      const favorites = user ? await buyerDataRepository.listFavorites(db, user.uid) : [];
      const cart = user ? await buyerDataRepository.listCart(db, user.uid) : [];
      if (!active) return;
      setProducts(catalog);
      setFavoriteIds(favorites.map((item) => item.id));
      setCartItems(cart.map((item) => ({ productId: item.product_id, quantity: item.quantity })));
    })().catch((error: unknown) => console.error('Local store load failed', error));
    return () => { active = false; };
  }, [user?.uid]);

  const value = useMemo<DemoStoreValue>(() => ({
    products, favoriteIds, cartItems, refreshProducts,
    toggleFavorite: (productId) => {
      if (!user) { router.push('/login'); return; }
      void (async () => {
        const db = await initializeDatabase();
        if (favoriteIds.includes(productId)) {
          await buyerDataRepository.removeFavorite(db, user.uid, productId);
          setFavoriteIds((items) => items.filter((id) => id !== productId));
        } else {
          await buyerDataRepository.addFavorite(db, `${user.uid}_${productId}`, user.uid, productId, new Date().toISOString());
          setFavoriteIds((items) => [...items, productId]);
        }
      })().catch((error: unknown) => Alert.alert('Favorit gagal', String(error)));
    },
    addToCart: (productId) => {
      if (!user) { router.push('/login'); return; }
      void (async () => {
        const current = cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
        const product = products.find((item) => item.id === productId);
        if (!product || current >= (product.stock ?? 0)) { Alert.alert('Stok habis', 'Jumlah melebihi stok yang tersedia.'); return; }
        const db = await initializeDatabase();
        await buyerDataRepository.setCartQuantity(db, `${user.uid}_${productId}`, user.uid, productId, current + 1, new Date().toISOString());
        setCartItems((items) => current ? items.map((item) => item.productId === productId ? { ...item, quantity: current + 1 } : item) : [...items, { productId, quantity: 1 }]);
      })().catch((error: unknown) => Alert.alert('Keranjang gagal', error instanceof Error ? error.message : String(error)));
    },
    setQuantity: (productId, quantity) => {
      if (!user) return;
      void (async () => {
        const db = await initializeDatabase();
        await buyerDataRepository.setCartQuantity(db, `${user.uid}_${productId}`, user.uid, productId, quantity, new Date().toISOString());
        setCartItems((items) => items.map((item) => item.productId === productId ? { ...item, quantity } : item));
      })().catch((error: unknown) => Alert.alert('Stok tidak cukup', error instanceof Error ? error.message : String(error)));
    },
    removeFromCart: (productId) => {
      if (!user) return;
      void (async () => {
        const db = await initializeDatabase();
        await buyerDataRepository.removeCartItem(db, user.uid, productId);
        setCartItems((items) => items.filter((item) => item.productId !== productId));
      })().catch((error: unknown) => Alert.alert('Gagal menghapus', String(error)));
    },
  }), [products, favoriteIds, cartItems, user?.uid]);
  return <DemoStore.Provider value={value}>{children}</DemoStore.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const value = useContext(DemoStore);
  if (!value) throw new Error('useDemoStore must be used inside DemoStoreProvider.');
  return value;
}
