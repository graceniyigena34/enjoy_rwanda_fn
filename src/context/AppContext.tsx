import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  vendorName: string;
  image?: string;
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
  role: "visitor" | "vendor" | "admin";
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  user: User | null;
  login: (user: User) => void;
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
    items: [
      { name: "Rwandan Coffee (1kg)", price: 12000, quantity: 1 },
    ],
    total: 12000,
    status: "confirmed",
    vendor: "Kigali Fresh Market",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
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
    setCart((prev) => prev.filter((item) => item.vendorName !== restaurantName));
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, user, login, logout, orders, saveOrder, darkMode, toggleDark }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
