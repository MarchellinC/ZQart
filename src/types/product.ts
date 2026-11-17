export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  emoji: string;
  artColor: string;
  badge?: string;
  description?: string;
  image_url?: string | null;
  stock?: number;
};
