type StockState = Record<string, Record<string, number>>;

const STORAGE_KEY = "enjoy-rwanda.shopStock.v1";

const safeParse = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const clampNonNegativeInt = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);

export const readShopStockState = (): StockState => {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!parsed || typeof parsed !== "object") return {};
  return parsed as StockState;
};

export const writeShopStockState = (state: StockState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getShopProductStockOverride = (shopId: number, productId: number) => {
  const state = readShopStockState();
  const shopRecord = state[String(shopId)];
  if (!shopRecord) return null;
  const value = shopRecord[String(productId)];
  return typeof value === "number" && Number.isFinite(value) ? clampNonNegativeInt(value) : null;
};

export const setShopProductStockOverride = (shopId: number, productId: number, stock: number) => {
  const state = readShopStockState();
  const shopKey = String(shopId);
  const nextShop = { ...(state[shopKey] ?? {}) };
  nextShop[String(productId)] = clampNonNegativeInt(stock);
  writeShopStockState({ ...state, [shopKey]: nextShop });
};

export const getEffectiveShopProductStock = (shopId: number, productId: number, fallbackStock: number) => {
  const override = getShopProductStockOverride(shopId, productId);
  return override === null ? clampNonNegativeInt(fallbackStock) : override;
};

export const decrementShopProductStock = (shopId: number, productId: number, qty: number, fallbackStock: number) => {
  const current = getEffectiveShopProductStock(shopId, productId, fallbackStock);
  const quantity = clampNonNegativeInt(qty);
  if (quantity <= 0) return { ok: true, newStock: current };
  if (current < quantity) return { ok: false, reason: "insufficient_stock" as const, newStock: current };
  const next = current - quantity;
  setShopProductStockOverride(shopId, productId, next);
  return { ok: true, newStock: next };
};

