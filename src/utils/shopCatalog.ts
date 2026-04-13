import { shops as mockShops } from "../data/mockData";
import { getEffectiveShopProductStock } from "./shopStockStorage";
import { readVendorShops } from "./vendorShopStorage";

export type ShopProduct = { id: number; name: string; price: number; description: string; image: string; stock: number; active?: boolean };
export type Shop = { id: number; name: string; description: string; location: string; rating: number; image: string; category: string; products: ShopProduct[] };

export const getAllShops = (): Shop[] => {
  const vendorShops = readVendorShops().map((shop) => ({
    id: shop.id,
    name: shop.name,
    description: shop.description,
    location: shop.location,
    rating: shop.rating,
    image: shop.image,
    category: shop.category,
    products: shop.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
      stock: p.stock,
      active: p.active,
    })),
  }));

  const baseShops = mockShops.map((shop) => ({
    ...shop,
    products: shop.products.map((p) => ({
      ...p,
      stock: getEffectiveShopProductStock(shop.id, p.id, p.stock),
    })),
  }));

  return [...baseShops, ...vendorShops];
};

export const getShopById = (id: number) => getAllShops().find((shop) => shop.id === id) ?? null;

