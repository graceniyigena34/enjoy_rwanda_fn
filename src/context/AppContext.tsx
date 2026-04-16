import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  lineId: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  vendorName: string;
  image?: string;
  shopId?: number;
  stock?: number;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  vendor: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "visitor" | "vendor" | "manager" | "admin";
  roles?: string[];
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "lineId">) => void;
  removeFromCart: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  user: User | null;
  token: string | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  orders: Order[];
  saveOrder: (restaurantName: string, items: CartItem[]) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2025-07-10",
    items: [
      { name: "Grilled Tilapia", price: 9000, quantity: 1 },
      { name: "Isombe", price: 9000, quantity: 1 },
    ],
    total: 18000,
    status: "delivered",
    vendor: "Kigali Serena Restaurant",
  },
  {
    id: "ORD-002",
    date: "2025-07-08",
    items: [
      { name: "Agaseke Basket", price: 12000, quantity: 1 },
      { name: "Rwandan Fabric", price: 11000, quantity: 1 },
    ],
    total: 23000,
    status: "processing",
    vendor: "Rwanda Craft Market",
  },
  {
    id: "ORD-003",
    date: "2025-07-05",
    items: [{ name: "Rwandan Coffee (1kg)", price: 12000, quantity: 1 }],
    total: 12000,
    status: "confirmed",
    vendor: "Kigali Fresh Market",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const saveOrder = (restaurantName: string, items: CartItem[]) => {
    if (items.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      items: items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "confirmed",
      vendor: restaurantName,
    };
    setOrders((prev) => [...prev, newOrder]);
    setCart((prev) =>
      prev.filter((item) => item.vendorName !== restaurantName),
    );
  };

  const buildCartLineId = (
    item: Pick<CartItem, "id" | "vendorName" | "shopId">,
  ) =>
    typeof item.shopId === "number"
      ? `shop:${item.shopId}:${item.id}`
      : `vendor:${item.vendorName}:${item.id}`;

  const addToCart = (item: Omit<CartItem, "quantity" | "lineId">) => {
    setCart((prev) => {
      const lineId = buildCartLineId(item);
      const existing = prev.find((i) => i.lineId === lineId);
      const maxStock =
        typeof item.stock === "number" && Number.isFinite(item.stock)
          ? Math.max(0, Math.floor(item.stock))
          : null;

      if (existing) {
        const nextQty = existing.quantity + 1;
        if (maxStock !== null && nextQty > maxStock) return prev;
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: nextQty } : i,
        );
      }
      if (maxStock !== null && maxStock <= 0) return prev;
      return [
        ...prev,
        { ...item, lineId, quantity: 1, stock: maxStock ?? item.stock },
      ];
    });
  };

  const removeFromCart = (lineId: string) =>
    setCart((prev) => prev.filter((i) => i.lineId !== lineId));

  const updateQty = (lineId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(lineId);
    setCart((prev) =>
      prev.map((i) => {
        if (i.lineId !== lineId) return i;
        const maxStock =
          typeof i.stock === "number" && Number.isFinite(i.stock)
            ? Math.max(0, Math.floor(i.stock))
            : null;
        const nextQty = maxStock === null ? qty : Math.min(qty, maxStock);
        return { ...i, quantity: nextQty };
      }),
    );
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const login = (u: User, t?: string) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    if (t) {
      setToken(t);
      localStorage.setItem("token", t);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        user,
        token,
        login,
        logout,
        orders,
        saveOrder,
        darkMode,
        toggleDark,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

/** Returns true if the user has the given role (checks both role and roles[]) */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  if (user.role === role) return true;
  if (Array.isArray(user.roles) && user.roles.includes(role)) return true;
  return false;
}
