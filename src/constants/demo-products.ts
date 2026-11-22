import type { Product } from '@/types/product';

export const demoProducts: Product[] = [
  {
    id: 'p1', name: 'Vas Keramik Senja', category: 'Dekorasi', price: 89000,
    rating: 4.9, reviewCount: 28, emoji: '🏺', artColor: '#EADCF3', badge: 'Bestseller',
  },
  {
    id: 'p2', name: 'Tas Anyam Laras', category: 'Aksesori', price: 145000,
    rating: 4.8, reviewCount: 16, emoji: '🧺', artColor: '#F3E4D4', badge: 'Handmade',
  },
  {
    id: 'p3', name: 'Mug Tanah Liat', category: 'Rumah', price: 65000,
    rating: 4.7, reviewCount: 34, emoji: '☕', artColor: '#E6E5D5',
  },
  {
    id: 'p4', name: 'Selendang Pagi', category: 'Aksesori', price: 125000,
    rating: 4.9, reviewCount: 21, emoji: '🧣', artColor: '#F2DDE3', badge: 'Terbaru',
  },
  {
    id: 'p5', name: 'Lampu Bambu Awan', category: 'Rumah', price: 210000,
    rating: 4.8, reviewCount: 12, emoji: '🏮', artColor: '#F4E7CF',
  },
  {
    id: 'p6', name: 'Syal Rajut Purnama', category: 'Kerajinan', price: 98000,
    rating: 4.6, reviewCount: 19, emoji: '🧶', artColor: '#E0E6F0',
  },
];

export const demoCategories = ['Semua', 'Dekorasi', 'Aksesori', 'Rumah', 'Kerajinan'];
