import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { initializeDatabase, buyerDataRepository } from '@/database';
import { ensureCatalogSeed, loadCatalog } from '@/database/catalog';
import { getPendingSyncCount } from '@/database/sync-queue';
import { refreshPublicCatalog } from '@/services/api/catalog';
import { synchronize } from '../services/firebase/sync';
import { useAuth } from './auth-context';
import type { Product } from '@/types/product';

export type DemoCartItem = { productId: string; quantity: number };
export type SyncInfo = {
  state: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  pending: number; lastSyncedAt: string | null; error: string | null;
};
type DemoStoreValue = {
  products: Product[]; favoriteIds: string[]; cartItems: DemoCartItem[];
  refreshProducts: () => Promise<void>; toggleFavorite: (id: string) => void;
  addToCart: (id: string) => void; setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void; syncInfo: SyncInfo; syncNow: () => Promise<void>;
};
const DemoStore = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const uid = user?.uid;
  const isBuyer = !!uid && role === 'buyer';
  const [products, setProducts] = useState<Product[]>([]);
  const [buyerSnapshot, setBuyerSnapshot] = useState<{
    uid: string | null; favoriteIds: string[]; cartItems: DemoCartItem[];
  }>({ uid: null, favoriteIds: [], cartItems: [] });
  const favoriteIds = useMemo(() => isBuyer && buyerSnapshot.uid === uid ? buyerSnapshot.favoriteIds : [],
    [buyerSnapshot.favoriteIds, buyerSnapshot.uid, isBuyer, uid]);
  const cartItems = useMemo(() => isBuyer && buyerSnapshot.uid === uid ? buyerSnapshot.cartItems : [],
    [buyerSnapshot.cartItems, buyerSnapshot.uid, isBuyer, uid]);
  const [syncInfo, setSyncInfo] = useState<SyncInfo>({ state: 'idle', pending: 0, lastSyncedAt: null, error: null });
  const syncRunning = useRef(false);
  const syncRequested = useRef(false);
  const syncNowRef = useRef<() => Promise<void>>(async () => {});
  const lastApiRefresh = useRef(0);
  const lastSyncedAt = useRef<string | null>(null);

  const refreshProducts = useCallback(async () => {
    const db = await initializeDatabase();
    await ensureCatalogSeed(db);
    setProducts(await loadCatalog(db));
  }, []);

  const loadBuyerData = useCallback(async () => {
    if (!isBuyer || !uid) {
      setBuyerSnapshot({ uid: uid ?? null, favoriteIds: [], cartItems: [] });
      return;
    }
    const db = await initializeDatabase();
    const [favorites, cart] = await Promise.all([
      buyerDataRepository.listFavorites(db, uid), buyerDataRepository.listCart(db, uid),
    ]);
    setBuyerSnapshot({ uid, favoriteIds: favorites.map((item) => item.id),
      cartItems: cart.map((item) => ({ productId: item.product_id, quantity: item.quantity })) });
  }, [isBuyer, uid]);

  const syncNow = useCallback(async () => {
    if (syncRunning.current) { syncRequested.current = true; return; }
    syncRunning.current = true;
    setSyncInfo((current) => ({ ...current, state: 'syncing', error: null }));
    try {
      const db = await initializeDatabase();
      await ensureCatalogSeed(db);
      setProducts(await loadCatalog(db));
      const network = await NetInfo.fetch();
      if (!network.isConnected || network.isInternetReachable === false) {
        setSyncInfo({ state: 'offline', pending: await getPendingSyncCount(db), lastSyncedAt: lastSyncedAt.current, error: null });
        return;
      }

      let apiError: string | null = null;
      if (Date.now() - lastApiRefresh.current > 5 * 60 * 1000) {
        try {
          await refreshPublicCatalog(db);
          lastApiRefresh.current = Date.now();
        } catch (error) {
          apiError = error instanceof Error ? error.message : String(error);
        }
      }
      const summary = await synchronize(db, { uid: uid ?? null, role });
      const [catalog, pending] = await Promise.all([loadCatalog(db), getPendingSyncCount(db)]);
      // Applying remote deletion tombstones can update local data after the first buyer read.
      await loadBuyerData();
      setProducts(catalog);
      const syncError = [summary.failed ? `${summary.failed} perubahan gagal disinkronkan.` : null, apiError]
        .filter(Boolean).join(' ') || null;
      if (!summary.failed) lastSyncedAt.current = new Date().toISOString();
      setSyncInfo({ state: syncError ? 'error' : 'synced', pending, lastSyncedAt: lastSyncedAt.current, error: syncError });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSyncInfo((current) => ({ ...current, state: 'error', error: message }));
    } finally {
      syncRunning.current = false;
      if (syncRequested.current) {
        syncRequested.current = false;
        void Promise.resolve().then(() => syncNowRef.current());
      }
    }
  }, [loadBuyerData, role, uid]);

  useEffect(() => { syncNowRef.current = syncNow; }, [syncNow]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const db = await initializeDatabase();
      await ensureCatalogSeed(db);
      const [catalog, favorites, cart] = await Promise.all([
        loadCatalog(db),
        isBuyer && uid ? buyerDataRepository.listFavorites(db, uid) : Promise.resolve([]),
        isBuyer && uid ? buyerDataRepository.listCart(db, uid) : Promise.resolve([]),
      ]);
      if (!active) return;
      setProducts(catalog);
      setBuyerSnapshot({ uid: isBuyer ? uid ?? null : null, favoriteIds: favorites.map((item) => item.id),
        cartItems: cart.map((item) => ({ productId: item.product_id, quantity: item.quantity })) });
      void syncNow();
    })().catch((error: unknown) => console.error('Local store load failed', error));
    return () => { active = false; };
  }, [isBuyer, syncNow, uid]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void syncNow();
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncNow();
    });
    return () => { unsubscribe(); appState.remove(); };
  }, [syncNow]);

  const value = useMemo<DemoStoreValue>(() => ({
    products, favoriteIds, cartItems, refreshProducts, syncInfo, syncNow,
    toggleFavorite: (productId) => {
      if (!isBuyer || !uid) { router.push('/login'); return; }
      void (async () => {
        const db = await initializeDatabase();
        if (favoriteIds.includes(productId)) await buyerDataRepository.removeFavorite(db, uid, productId);
        else await buyerDataRepository.addFavorite(db, `${uid}_${productId}`, uid, productId, new Date().toISOString());
        await loadBuyerData();
        const pending = await getPendingSyncCount(db);
        setSyncInfo((current) => ({ ...current, pending }));
        void syncNow();
      })().catch((error: unknown) => Alert.alert('Favorit gagal', error instanceof Error ? error.message : String(error)));
    },
    addToCart: (productId) => {
      if (!isBuyer || !uid) { router.push('/login'); return; }
      void (async () => {
        const current = cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
        const product = products.find((item) => item.id === productId);
        if (!product || current >= (product.stock ?? 0)) { Alert.alert('Stok habis', 'Jumlah melebihi stok yang tersedia.'); return; }
        const db = await initializeDatabase();
        await buyerDataRepository.setCartQuantity(db, `${uid}_${productId}`, uid, productId, current + 1, new Date().toISOString());
        await loadBuyerData();
        const pending = await getPendingSyncCount(db);
        setSyncInfo((info) => ({ ...info, pending }));
        void syncNow();
      })().catch((error: unknown) => Alert.alert('Keranjang gagal', error instanceof Error ? error.message : String(error)));
    },
    setQuantity: (productId, quantity) => {
      if (!isBuyer || !uid) return;
      void (async () => {
        const db = await initializeDatabase();
        await buyerDataRepository.setCartQuantity(db, `${uid}_${productId}`, uid, productId, quantity, new Date().toISOString());
        await loadBuyerData();
        const pending = await getPendingSyncCount(db);
        setSyncInfo((info) => ({ ...info, pending }));
        void syncNow();
      })().catch((error: unknown) => Alert.alert('Stok tidak cukup', error instanceof Error ? error.message : String(error)));
    },
    removeFromCart: (productId) => {
      if (!isBuyer || !uid) return;
      void (async () => {
        const db = await initializeDatabase();
        await buyerDataRepository.removeCartItem(db, uid, productId);
        await loadBuyerData();
        const pending = await getPendingSyncCount(db);
        setSyncInfo((info) => ({ ...info, pending }));
        void syncNow();
      })().catch((error: unknown) => Alert.alert('Gagal menghapus', error instanceof Error ? error.message : String(error)));
    },
  }), [cartItems, favoriteIds, isBuyer, loadBuyerData, products, refreshProducts, syncInfo, syncNow, uid]);
  return <DemoStore.Provider value={value}>{children}</DemoStore.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const value = useContext(DemoStore);
  if (!value) throw new Error('useDemoStore must be used inside DemoStoreProvider.');
  return value;
}
