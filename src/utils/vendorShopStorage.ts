export type VendorShopProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  active: boolean;
};

export type VendorShop = {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  products: VendorShopProduct[];
  updatedAt: string;
};

const STORAGE_KEY = "enjoy-rwanda.vendorShops.v1";
const DASHBOARD_STATE_PREFIX = "enjoy-rwanda.vendorDashboard.v1.";

const safeParse = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const buildVendorShopId = (vendorId: number) => 100_000 + vendorId;

export const readVendorShops = (): VendorShop[] => {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry): entry is VendorShop => {
    if (!entry || typeof entry !== "object") return false;
    const record = entry as Partial<VendorShop>;
    return typeof record.id === "number" && typeof record.vendorId === "number" && typeof record.name === "string" && Array.isArray(record.products);
  });
};

export const writeVendorShops = (shops: VendorShop[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
};

export const getVendorShopById = (shopId: number) => readVendorShops().find((shop) => shop.id === shopId) ?? null;

export const getVendorShopByVendorId = (vendorId: number) => readVendorShops().find((shop) => shop.vendorId === vendorId) ?? null;

export const upsertVendorShop = (shop: VendorShop) => {
  const shops = readVendorShops();
  const index = shops.findIndex((entry) => entry.id === shop.id);
  const next = { ...shop, updatedAt: new Date().toISOString() };
  if (index === -1) shops.push(next);
  else shops[index] = next;
  writeVendorShops(shops);
};

export const removeVendorShopByVendorId = (vendorId: number) => {
  const shops = readVendorShops();
  const next = shops.filter((shop) => shop.vendorId !== vendorId);
  writeVendorShops(next);
};

const clampNonNegativeInt = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);

const syncVendorDashboardProductStock = (vendorId: number, productId: number, stock: number) => {
  const key = `${DASHBOARD_STATE_PREFIX}${vendorId}`;
  const parsed = safeParse(localStorage.getItem(key));
  if (!parsed || typeof parsed !== "object") return;
  const record = parsed as { menuItems?: unknown };
  if (!Array.isArray(record.menuItems)) return;
  const updated = record.menuItems.map((item) => {
    if (!item || typeof item !== "object") return item;
    const candidate = item as { id?: unknown };
    if (candidate.id !== productId) return item;
    return { ...(item as Record<string, unknown>), stock };
  });
  localStorage.setItem(key, JSON.stringify({ ...(parsed as Record<string, unknown>), menuItems: updated }));
};

export const decrementVendorShopStock = (shopId: number, productId: number, qty: number) => {
  const quantity = clampNonNegativeInt(qty);
  if (quantity <= 0) return { ok: true, newStock: null as number | null };

  const shops = readVendorShops();
  const shopIndex = shops.findIndex((shop) => shop.id === shopId);
  if (shopIndex === -1) return { ok: false, reason: "shop_not_found" as const };

  const shop = shops[shopIndex];
  const productIndex = shop.products.findIndex((product) => product.id === productId);
  if (productIndex === -1) return { ok: false, reason: "product_not_found" as const };

  const product = shop.products[productIndex];
  const currentStock = clampNonNegativeInt(product.stock);
  if (currentStock < quantity) return { ok: false, reason: "insufficient_stock" as const, newStock: currentStock };

  const nextStock = currentStock - quantity;
  const nextProducts = [...shop.products];
  nextProducts[productIndex] = { ...product, stock: nextStock };
  const nextShop: VendorShop = { ...shop, products: nextProducts, updatedAt: new Date().toISOString() };
  const nextShops = [...shops];
  nextShops[shopIndex] = nextShop;
  writeVendorShops(nextShops);

  syncVendorDashboardProductStock(shop.vendorId, productId, nextStock);

  return { ok: true, newStock: nextStock };
};
