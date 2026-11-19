export interface Product {
  id: string; name: string; image: string;
  price: number | null; oldPrice: number | null; discount: number | null;
  store: string; category: string; description: string;
  affiliateUrl: string; productUrl: string; createdAt: string; active: boolean;
}
