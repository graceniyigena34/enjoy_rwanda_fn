import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, hasRole } from "../../context/AppContext";
import type { VendorApprovalStatus } from "../../utils/vendorApprovalStorage";
import { getVendorApplication, upsertVendorApplication } from "../../utils/vendorApprovalStorage";
import { buildVendorShopId, removeVendorShopByVendorId, upsertVendorShop } from "../../utils/vendorShopStorage";

type BusinessType = "Restaurant" | "Shop";
type Tab = "overview" | "catalog" | "orders" | "analytics" | "settings";
type Timeframe = "Weekly" | "Monthly" | "Quarterly";
type BookingStatus = "confirmed" | "pending" | "cancelled";
type OrderStatus = "pending" | "processing" | "delivered";
type NotificationTone = "emerald" | "amber" | "sky";
type OnboardingStep = 1 | 2 | 3 | 4;

type StoredUpload = {
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
};

type BusinessInfo = {
  businessName: string;
  businessType: BusinessType;
  location: string;
  openingHours: string;
  openingDays: string[];
  businessPhone: string;
  businessEmail: string;
  managerName: string;
  managerEmail: string;
  businessProfileImage?: StoredUpload;
  rdbCertificate?: StoredUpload;
  description: string;
};

type ProfileInfo = {
  ownerName: string;
  email: string;
  phone: string;
};

type CatalogItem = {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  status: string;
  metric: string;
  accent: string;
};

type BookingItem = {
  id: number;
  guest: string;
  slot: string;
  table: string;
  amount: number;
  status: BookingStatus;
};

type OrderItem = {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: OrderStatus;
  age: string;
};

type NotificationItem = {
  id: number;
  title: string;
  detail: string;
  tone: NotificationTone;
  time: string;
  unread: boolean;
};

type DashboardSeed = {
  profile: ProfileInfo;
  business: BusinessInfo;
  catalogItems: CatalogItem[];
  bookings: BookingItem[];
  orders: OrderItem[];
  notifications: NotificationItem[];
};

type DashboardPersisted = Partial<DashboardSeed> & {
  tab?: Tab;
  onboardingComplete?: boolean;
};

const ONBOARDING_STEPS: Array<{ id: OnboardingStep; title: string }> = [
  { id: 1, title: "Business Info" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Operating Details" },
  { id: 4, title: "Documents & Verification" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const money = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const restaurantSeed = (): DashboardSeed => ({
  profile: {
    ownerName: "Kigali Grill Team",
    email: "hello@kigali-grill.rw",
    phone: "+250 788 000 001",
  },
  business: {
    businessName: "Kigali Grill",
    businessType: "Restaurant",
    location: "Kigali, Rwanda",
    openingHours: "08:00",
    openingDays: [],
    businessPhone: "",
    businessEmail: "",
    managerName: "",
    managerEmail: "",
    description:
      "Modern restaurant dashboard for table bookings, menu updates, and live sales tracking.",
  },
  catalogItems: [
    {
      id: 1,
      name: "Grilled Tilapia",
      subtitle: "Signature menu item",
      price: 12000,
      status: "Trending",
      metric: "342 orders",
      accent: "bg-emerald-500",
    },
    {
      id: 2,
      name: "Volcano Roast (250g)",
      subtitle: "Local beef special",
      price: 14500,
      status: "Active",
      metric: "215 orders",
      accent: "bg-sky-500",
    },
    {
      id: 3,
      name: "Beef Sambusas",
      subtitle: "Appetizer item",
      price: 8000,
      status: "Active",
      metric: "188 orders",
      accent: "bg-amber-500",
    },
  ],
  bookings: [
    {
      id: 1,
      guest: "The Great Rift Valley Lunch",
      slot: "Today, 12:30",
      table: "T4",
      amount: 180000,
      status: "confirmed",
    },
    {
      id: 2,
      guest: "Kigali City Discovery Tour",
      slot: "Today, 15:00",
      table: "T2",
      amount: 450000,
      status: "pending",
    },
    {
      id: 3,
      guest: "Handwoven Imigongo Art",
      slot: "Tomorrow, 18:00",
      table: "T7",
      amount: 85000,
      status: "confirmed",
    },
  ],
  orders: [
    {
      id: "ORD-842",
      customer: "The Great Rift Valley Lunch",
      items: ["Grilled Tilapia", "Isombe"],
      total: 180000,
      status: "processing",
      age: "2 mins ago",
    },
    {
      id: "ORD-891",
      customer: "Kigali City Discovery Tour",
      items: ["Brochettes", "Passion Juice"],
      total: 450000,
      status: "pending",
      age: "15 mins ago",
    },
    {
      id: "ORD-887",
      customer: "Handwoven Imigongo Art",
      items: ["Beef Sambusas"],
      total: 85000,
      status: "delivered",
      age: "1 hour ago",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Reservation confirmed",
      detail: "Table T4 booked for 12:30 today.",
      tone: "emerald",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Order moved to processing",
      detail: "ORD-842 is now being prepared.",
      tone: "sky",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Menu item trending",
      detail: "Grilled Tilapia is still leading this week.",
      tone: "amber",
      time: "1 hour ago",
      unread: false,
    },
  ],
});

const shopSeed = (): DashboardSeed => ({
  profile: {
    ownerName: "Jean-Pierre K.",
    email: "hello@inzozi-fashion.rw",
    phone: "+250 788 000 222",
  },
  business: {
    businessName: "Inzozi Fashion",
    businessType: "Shop",
    location: "Kigali Heights, Rwanda",
    openingHours: "09:00",
    openingDays: [],
    businessPhone: "",
    businessEmail: "",
    managerName: "",
    managerEmail: "",
    description:
      "Retail dashboard for product listings, stock health, and fast order fulfillment.",
  },
  catalogItems: [
    {
      id: 1,
      name: "Handwoven Agaseke Basket",
      subtitle: "Traditional craft",
      price: 45000,
      status: "In stock",
      metric: "142 active listings",
      accent: "bg-emerald-500",
    },
    {
      id: 2,
      name: "Kivu Bourbon Coffee",
      subtitle: "Organic coffee beans",
      price: 24500,
      status: "Low stock",
      metric: "12 left",
      accent: "bg-rose-500",
    },
    {
      id: 3,
      name: "Imigongo Wall Art",
      subtitle: "Premium decor",
      price: 85000,
      status: "Trending",
      metric: "75 sales target",
      accent: "bg-sky-500",
    },
  ],
  bookings: [
    {
      id: 1,
      guest: "Stock re-check",
      slot: "Today, 10:00",
      table: "Main shelf",
      amount: 0,
      status: "confirmed",
    },
    {
      id: 2,
      guest: "Supplier pickup",
      slot: "Today, 16:00",
      table: "Warehouse",
      amount: 0,
      status: "pending",
    },
  ],
  orders: [
    {
      id: "ORD-117",
      customer: "Central Kigali pickup",
      items: ["Agaseke Basket"],
      total: 45000,
      status: "pending",
      age: "6 mins ago",
    },
    {
      id: "ORD-122",
      customer: "Hotel delivery",
      items: ["Kivu Bourbon Coffee"],
      total: 73500,
      status: "processing",
      age: "18 mins ago",
    },
    {
      id: "ORD-124",
      customer: "Online marketplace",
      items: ["Imigongo Wall Art"],
      total: 85000,
      status: "delivered",
      age: "1 hour ago",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Stock alert",
      detail: "Kivu Bourbon Coffee is below 15 units.",
      tone: "amber",
      time: "4 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Listing performing well",
      detail: "Imigongo Wall Art is now trending.",
      tone: "emerald",
      time: "12 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Fulfillment update",
      detail: "Order ORD-122 moved to processing.",
      tone: "sky",
      time: "45 min ago",
      unread: false,
    },
  ],
});

const demoSeed = (businessType: BusinessType) =>
  businessType === "Shop" ? shopSeed() : restaurantSeed();

const chartSeries = {
  Restaurant: [18, 22, 25, 42, 38, 19, 41],
  Shop: [22, 18, 31, 28, 40, 35, 44],
};

const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toneClasses: Record<NotificationTone, string> = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

const statusClasses: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  processing: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

function NavIcon({ tab }: { tab: Tab }) {
  if (tab === "overview") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (tab === "catalog") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.3 7L12 12l8.7-5" />
      </svg>
    );
  }
  if (tab === "orders") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M2 3h3l2.68 11.39A2 2 0 0 0 9.63 16h8.74a2 2 0 0 0 1.95-1.61L22 7H6" />
      </svg>
    );
  }
  if (tab === "analytics") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  accent: string;
}) {
  return (
    <div className="group rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span className={`h-3 w-3 rounded-full ${accent}`} />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{delta}</p>
    </div>
  );
}

export default function VendorDashboard() {
  const { user, logout, darkMode, toggleDark } = useApp();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(
    () => (user ? `enjoy-rwanda.vendorDashboard.v2.${user.id}` : null),
    [user],
  );
  const storedState = useMemo(() => {
    if (!storageKey || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as DashboardPersisted) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const initialSeed = useMemo(
    () => demoSeed(storedState?.business?.businessType ?? "Restaurant"),
    [storedState?.business?.businessType],
  );

  const [tab, setTab] = useState<Tab>(() => storedState?.tab ?? "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [onboardingDirection, setOnboardingDirection] = useState<
    "next" | "prev"
  >("next");
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() =>
    Boolean(storedState?.onboardingComplete),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<ProfileInfo>(
    () => storedState?.profile ?? initialSeed.profile,
  );
  const [business, setBusiness] = useState<BusinessInfo>(
    () => storedState?.business ?? initialSeed.business,
  );
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(
    () => storedState?.catalogItems ?? initialSeed.catalogItems,
  );
  const [bookings, setBookings] = useState<BookingItem[]>(
    () => storedState?.bookings ?? initialSeed.bookings,
  );
  const [orders, setOrders] = useState<OrderItem[]>(
    () => storedState?.orders ?? initialSeed.orders,
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => storedState?.notifications ?? initialSeed.notifications,
  );

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const isShop = business.businessType === "Shop";
  const catalogLabel = isShop ? "Products" : "Menu items";
  const primaryActionLabel = isShop ? "Add Product" : "Add Menu Item";
  const liveLabel = isShop ? "Inventory live" : "Service live";
  const navItems: { value: Tab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "catalog", label: catalogLabel },
    { value: "orders", label: isShop ? "Fulfillment" : "Orders" },
    { value: "analytics", label: "Analytics" },
    { value: "settings", label: "Settings" },
  ];

  const stats = useMemo(() => {
    if (isShop) {
      const inventoryValue =
        catalogItems.reduce((sum, item) => sum + item.price, 0) * 3;
      const lowStockCount = catalogItems.filter((item) =>
        item.status.toLowerCase().includes("low"),
      ).length;
      return [
        {
          label: "Inventory value",
          value: `RWF ${compact.format(inventoryValue)}`,
          delta: "+14.2% vs last month",
          accent: "bg-emerald-500",
        },
        {
          label: "Active listings",
          value: String(catalogItems.length),
          delta: "+6 new items this week",
          accent: "bg-sky-500",
        },
        {
          label: "Low stock alerts",
          value: String(lowStockCount),
          delta: "Needs restock review",
          accent: "bg-amber-500",
        },
        {
          label: "Conversion rate",
          value: "84.2%",
          delta: "Above industry average",
          accent: "bg-slate-500",
        },
      ];
    }

    return [
      {
        label: "Total sales",
        value: "RWF 2.4M",
        delta: "+12.5% vs last month",
        accent: "bg-emerald-500",
      },
      {
        label: "Total orders",
        value: "1,284",
        delta: "+8.2% vs last month",
        accent: "bg-sky-500",
      },
      {
        label: "Total bookings",
        value: "452",
        delta: "-2.1% vs last month",
        accent: "bg-amber-500",
      },
      {
        label: "Active items",
        value: String(catalogItems.length),
        delta: "Steady, no change",
        accent: "bg-slate-500",
      },
    ];
  }, [catalogItems, isShop]);

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return catalogItems;
    return catalogItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query),
    );
  }, [catalogItems, searchQuery]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(
      (order) =>
        order.customer.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.toLowerCase().includes(query)),
    );
  }, [orders, searchQuery]);

  const notificationCount = notifications.filter((item) => item.unread).length;

  const onboardingReady = useMemo(
    () =>
      business.businessName.trim().length > 0 &&
      business.businessType.trim().length > 0 &&
      business.description.trim().length > 0 &&
      business.location.trim().length > 0 &&
      business.businessPhone.trim().length > 0 &&
      business.businessEmail.trim().length > 0 &&
      business.managerName.trim().length > 0 &&
      business.managerEmail.trim().length > 0 &&
      business.openingHours.trim().length > 0 &&
      business.openingDays.length > 0 &&
      Boolean(business.businessProfileImage) &&
      Boolean(business.rdbCertificate),
    [business],
  );

  const toggleOpeningDay = (day: string) => {
    setBusiness((current) => ({
      ...current,
      openingDays: current.openingDays.includes(day)
        ? current.openingDays.filter((entry) => entry !== day)
        : [...current.openingDays, day],
    }));
  };

  const mapFileToUpload = (file: File, previewUrl?: string): StoredUpload => ({
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    previewUrl,
  });

  const updateUploadField = (
    field: "businessProfileImage" | "rdbCertificate",
    file: File,
  ) => {
    if (field === "businessProfileImage") {
      const reader = new FileReader();
      reader.onload = () => {
        setBusiness((current) => ({
          ...current,
          businessProfileImage: mapFileToUpload(file, String(reader.result)),
        }));
      };
      reader.readAsDataURL(file);
      return;
    }

    setBusiness((current) => ({
      ...current,
      rdbCertificate: mapFileToUpload(file),
    }));
  };

  const validateCurrentStep = (step: OnboardingStep) => {
    if (step === 1) {
      return (
        business.businessName.trim().length > 0 &&
        business.businessType.trim().length > 0 &&
        business.description.trim().length > 0 &&
        business.location.trim().length > 0
      );
    }

    if (step === 2) {
      return (
        business.businessPhone.trim().length > 0 &&
        business.businessEmail.trim().length > 0 &&
        business.managerName.trim().length > 0 &&
        business.managerEmail.trim().length > 0
      );
    }

    if (step === 3) {
      return (
        business.openingHours.trim().length > 0 &&
        business.openingDays.length > 0
      );
    }

    return Boolean(business.businessProfileImage && business.rdbCertificate);
  };

  const goToNextStep = () => {
    if (!validateCurrentStep(onboardingStep)) {
      setOnboardingError("Please complete all required fields in this step.");
      return;
    }
    setOnboardingError(null);
    setOnboardingDirection("next");
    setOnboardingStep((current) => Math.min(4, current + 1) as OnboardingStep);
  };

  const goToPreviousStep = () => {
    setOnboardingError(null);
    setOnboardingDirection("prev");
    setOnboardingStep((current) => Math.max(1, current - 1) as OnboardingStep);
  };

  const submitOnboarding = () => {
    if (!onboardingReady) {
      setOnboardingError("Please complete all steps before submitting.");
      return;
    }
    setOnboardingError(null);
    setOnboardingComplete(true);
  };

  const applyBusinessType = (nextType: BusinessType) => {
    const seed = demoSeed(nextType);
    setBusiness((current) => ({
      ...current,
      businessType: nextType,
      businessName: seed.business.businessName,
      location: seed.business.location,
      openingHours: seed.business.openingHours,
      openingDays: seed.business.openingDays,
      businessPhone: seed.business.businessPhone,
      businessEmail: seed.business.businessEmail,
      managerName: seed.business.managerName,
      managerEmail: seed.business.managerEmail,
      businessProfileImage: undefined,
      rdbCertificate: undefined,
      description: seed.business.description,
    }));
    setProfile(seed.profile);
    setCatalogItems(seed.catalogItems);
    setBookings(seed.bookings);
    setOrders(seed.orders);
    setNotifications(seed.notifications);
    setTab("overview");
  };

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        profile,
        business,
        catalogItems,
        bookings,
        orders,
        notifications,
        tab,
        onboardingComplete,
      }),
    );
  }, [
    storageKey,
    profile,
    business,
    catalogItems,
    bookings,
    orders,
    notifications,
    tab,
    onboardingComplete,
  ]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<DashboardSeed> & {
          tab?: Tab;
          onboardingComplete?: boolean;
        };
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.catalogItems) setCatalogItems(parsed.catalogItems);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.tab) setTab(parsed.tab);
        if (typeof parsed.onboardingComplete === "boolean") {
          setOnboardingComplete(parsed.onboardingComplete);
        }
      } catch {
        // Ignore malformed storage payloads.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const feedByRole: Record<
      BusinessType,
      Array<{ title: string; detail: string; tone: NotificationTone }>
    > = {
      Restaurant: [
        {
          title: "New reservation",
          detail: "A guest booked table T6 for this evening.",
          tone: "emerald",
        },
        {
          title: "Order moved",
          detail: "The kitchen just picked up the latest order.",
          tone: "sky",
        },
        {
          title: "Top seller updated",
          detail: "Grilled Tilapia is still the most requested dish.",
          tone: "amber",
        },
      ],
      Shop: [
        {
          title: "Stock sync complete",
          detail: "Your latest inventory refresh finished successfully.",
          tone: "emerald",
        },
        {
          title: "Low stock warning",
          detail: "One or more products need restocking today.",
          tone: "amber",
        },
        {
          title: "New order received",
          detail: "A marketplace order just entered fulfillment.",
          tone: "sky",
        },
      ],
    };

    const timer = window.setInterval(() => {
      const sample =
        feedByRole[business.businessType][
          Math.floor(Math.random() * feedByRole[business.businessType].length)
        ];
      const id = Date.now();
      setNotifications((current) => [
        {
          id,
          title: sample.title,
          detail: sample.detail,
          tone: sample.tone,
          time: "Just now",
          unread: true,
        },
        ...current.slice(0, 5),
      ]);
    }, 12000);

    return () => window.clearInterval(timer);
  }, [business.businessType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chartValues = chartSeries[business.businessType];
  const linePoints = chartValues
    .map(
      (value, index) =>
        `${(index / (chartValues.length - 1)) * 100},${100 - value * 2}`,
    )
    .join(" ");

  const inventoryBars = isShop
    ? [44, 56, 49, 71, 63, 84, 58]
    : [32, 35, 40, 51, 58, 36, 54];
  const orderBars = isShop ? [26, 41, 33, 62] : [33, 47, 38, 66];

  if (!user || user.role !== "vendor") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-900/85">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Vendor access
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
            Access denied
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Login as a vendor to open this dashboard.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-emerald-600 dark:text-emerald-300">
                Vendor onboarding
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                Complete your vendor profile first
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Fill the required steps below before the dashboard becomes
                available.
              </p>
            </div>

            <div className="mt-8 overflow-hidden">
              <div
                key={onboardingStep}
                className={`rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 ${onboardingDirection === "next" ? "animate-[vendor-step-next_260ms_ease]" : "animate-[vendor-step-prev_260ms_ease]"}`}
              >
                {onboardingStep === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>business_name</span>
                      <input
                        value={business.businessName}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>business_type</span>
                      <select
                        value={business.businessType}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessType: event.target.value as BusinessType,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      >
                        <option value="Restaurant">Restaurant</option>
                        <option value="Shop">Shop</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>location</span>
                      <input
                        value={business.location}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            location: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>business_description</span>
                      <textarea
                        rows={4}
                        value={business.description}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>business_phone</span>
                      <input
                        value={business.businessPhone}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessPhone: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>business_email</span>
                      <input
                        type="email"
                        value={business.businessEmail}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessEmail: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>manager_name</span>
                      <input
                        value={business.managerName}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            managerName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>manager_email</span>
                      <input
                        type="email"
                        value={business.managerEmail}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            managerEmail: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>opening_hours</span>
                      <input
                        type="time"
                        value={business.openingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            openingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>opening_days</span>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {WEEK_DAYS.map((day) => (
                          <label
                            key={day}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={business.openingDays.includes(day)}
                              onChange={() => toggleOpeningDay(day)}
                            />
                            <span>{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 4 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>business_profile_image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          updateUploadField("businessProfileImage", file);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                      />
                      {business.businessProfileImage?.previewUrl && (
                        <img
                          src={business.businessProfileImage.previewUrl}
                          alt="Business preview"
                          className="h-24 w-24 rounded-xl object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>rdb_certificate</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          updateUploadField("rdbCertificate", file);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                      />
                      {business.rdbCertificate && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Uploaded: {business.rdbCertificate.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {onboardingError && (
              <p className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-300">
                {onboardingError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={onboardingStep === 1}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-200"
              >
                Previous
              </button>

              {onboardingStep < 4 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitOnboarding}
                  className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Submit & Go to Dashboard
                </button>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Steps Indicator
            </p>
            <div className="mt-6 space-y-5">
              {ONBOARDING_STEPS.map((step, index) => {
                const isCurrent = onboardingStep === step.id;
                const isCompleted = onboardingStep > step.id;
                const isUpcoming = onboardingStep < step.id;
                return (
                  <div key={step.id} className="relative pl-8">
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <span className="absolute left-[11px] top-7 h-10 w-[2px] bg-slate-200 dark:bg-white/10" />
                    )}
                    <span
                      className={`absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}
                    >
                      {isCompleted ? "✔" : step.id}
                    </span>
                    <p
                      className={`text-sm ${isCurrent ? "font-bold text-emerald-600 dark:text-emerald-300" : isUpcoming ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {step.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
            aria-label="Close sidebar"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-white/60 bg-white/90 px-4 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 dark:border-white/10 dark:bg-slate-950/92 md:translate-x-0 md:bg-white/70 md:backdrop-blur-xl md:dark:bg-slate-950/70 ${sidebarCollapsed ? "md:w-24" : "md:w-72"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex items-start justify-between gap-2 px-3 pb-2 pt-1">
            <div className="min-w-0">
              {sidebarCollapsed ? (
                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white md:flex">
                  {business.businessName.slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {business.businessName}
                  </p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {business.businessType} portal
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-emerald-400 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 md:inline-flex"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "»" : "«"}
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTab(item.value);
                  setSidebarOpen(false);
                }}
                title={item.label}
                className={`group flex w-full items-center rounded-2xl py-3 text-left text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-950/5 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"} ${tab === item.value ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-600 dark:text-slate-300"}`}
              >
                {sidebarCollapsed ? (
                  <span className="inline-flex items-center justify-center">
                    <NavIcon tab={item.value} />
                  </span>
                ) : (
                  <>
                    <span>{item.label}</span>
                    <span
                      className={`text-xs transition-transform duration-300 group-hover:translate-x-0.5 ${tab === item.value ? "text-white/80" : "text-slate-400"}`}
                    >
                      →
                    </span>
                  </>
                )}
              </button>
            ))}
          </nav>

          <div
            className={`mt-6 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 ${sidebarCollapsed ? "md:hidden" : ""}`}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Business type
            </p>
            <div className="mt-3 flex rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-white/10">
              <button
                type="button"
                onClick={() => applyBusinessType("Restaurant")}
                className={`flex-1 rounded-full px-3 py-2 transition ${business.businessType === "Restaurant" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => applyBusinessType("Shop")}
                className={`flex-1 rounded-full px-3 py-2 transition ${business.businessType === "Shop" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                Shop
              </button>
            </div>
          </div>
        </aside>

        <div
          className={`hidden shrink-0 md:block ${sidebarCollapsed ? "w-24" : "w-72"}`}
          aria-hidden="true"
        />

        <main className="min-w-0 flex-1 px-4 pb-8 pt-3 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-20 -mx-4 border-b border-slate-200/70 bg-slate-100/95 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:hidden"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
                <label className="flex min-w-[180px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-200/60 px-4 py-2.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 sm:max-w-md">
                  <span>⌕</span>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search menu items..."
                    className="w-full border-none bg-transparent outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setTab("settings")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  aria-label="Open notifications"
                  title="Notifications"
                >
                  <span className="relative inline-flex">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                      <path d="M9 17a3 3 0 0 0 6 0" />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={toggleDark}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                  title={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? "☀" : "☾"}
                </button>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    aria-label="Open profile menu"
                  >
                    <span className="hidden text-right sm:block">
                      <span className="block max-w-[130px] truncate text-sm font-semibold leading-tight">
                        {user.name}
                      </span>
                      <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Premium vendor
                      </span>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-slate-900 text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-12 z-30 min-w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900">
                      <div className="mb-1 rounded-xl px-3 py-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleDark();
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        <span>{darkMode ? "Light mode" : "Dark mode"}</span>
                        <span>{darkMode ? "☀" : "☾"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <span>Logout</span>
                        <span>↪</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-6 space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                      Dashboard overview
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {isShop ? "Product Catalog" : "Sales Overview"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {isShop
                        ? "Track inventory, watch category performance, and react to stock changes before they slow sales."
                        : "Monitor revenue streams, table bookings, and item performance in one live view."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {navItems.slice(0, 3).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setTab(item.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === item.value ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>
              </div>

              <SectionCard
                title="Notifications"
                subtitle="Real-time updates from bookings, orders, and inventory syncs"
                action={
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {liveLabel}
                  </span>
                }
              >
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        setNotifications((current) =>
                          current.map((entry) =>
                            entry.id === notification.id
                              ? { ...entry, unread: false }
                              : entry,
                          ),
                        )
                      }
                      className="flex w-full items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <span
                        className={`mt-0.5 h-2.5 w-2.5 rounded-full ${notification.unread ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${toneClasses[notification.tone]}`}
                      >
                        {notification.time}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                          {notification.title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                          {notification.detail}
                        </span>
                      </span>
                    </button>
                  ))}
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    New events appear here automatically every few seconds.
                  </div>
                </div>
              </SectionCard>
            </section>

            {tab === "overview" && (
              <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <SectionCard
                  title={isShop ? "Inventory trend" : "Weekly sales pulse"}
                  subtitle={
                    isShop
                      ? "Live stock movement across the last seven days"
                      : "Revenue performance across the current week"
                  }
                  action={
                    <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-white/5">
                      {(["Weekly", "Monthly", "Quarterly"] as Timeframe[]).map(
                        (item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setTimeframe(item)}
                            className={`rounded-full px-3 py-1.5 transition ${timeframe === item ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>
                  }
                >
                  <div className="grid gap-4 lg:grid-cols-[1.35fr_0.8fr]">
                    <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <svg
                        viewBox="0 0 100 60"
                        className="h-72 w-full overflow-visible"
                      >
                        <defs>
                          <linearGradient
                            id="vendorChart"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#10b981"
                              stopOpacity="0.8"
                            />
                            <stop
                              offset="100%"
                              stopColor="#10b981"
                              stopOpacity="0.08"
                            />
                          </linearGradient>
                        </defs>
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={linePoints}
                        />
                        <polygon
                          fill="url(#vendorChart)"
                          points={`0,100 ${linePoints} 100,100`}
                          opacity="0.75"
                        />
                      </svg>
                      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        {chartLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                          Quick summary
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                          {isShop ? "Category health" : "Volume analysis"}
                        </p>
                      </div>
                      {inventoryBars.map((value, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span>
                              {isShop
                                ? [
                                    "Beverages",
                                    "Handicrafts",
                                    "Decor",
                                    "Coffee",
                                    "Accessories",
                                    "Bundles",
                                    "Online",
                                  ][index]
                                : [
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                    "Sun",
                                  ][index]}
                            </span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/80 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-6">
                  <SectionCard
                    title={
                      isShop ? "Popular categories" : "Top performing items"
                    }
                    subtitle={
                      isShop
                        ? "Where the most sales are coming from"
                        : "Best-selling menu items by revenue"
                    }
                  >
                    <div className="space-y-4">
                      {filteredCatalog.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          <div
                            className={`h-14 w-14 rounded-2xl ${item.accent} shadow-lg shadow-emerald-500/15`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-950 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                  {item.subtitle}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[item.status.toLowerCase()] ?? "bg-slate-500/15 text-slate-600"}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                              <span>{item.metric}</span>
                              <span className="font-semibold text-slate-950 dark:text-white">
                                {money.format(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Quick actions"
                    subtitle="High-frequency tasks with fast access"
                  >
                    <div className="grid gap-3">
                      {[
                        {
                          title: primaryActionLabel,
                          detail: isShop
                            ? "Create or edit a product listing."
                            : "Add a new dish to the live menu.",
                        },
                        {
                          title: isShop
                            ? "Restock inventory"
                            : "Review bookings",
                          detail: isShop
                            ? "Flag low stock items before they run out."
                            : "Confirm reservations and update table status.",
                        },
                        {
                          title: isShop ? "Promote listing" : "Create special",
                          detail: isShop
                            ? "Push a product to the homepage carousel."
                            : "Highlight a seasonal dining offer.",
                        },
                      ].map((action) => (
                        <button
                          key={action.title}
                          type="button"
                          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          <span>
                            <span className="block font-semibold text-slate-950 dark:text-white">
                              {action.title}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                              {action.detail}
                            </span>
                          </span>
                          <span className="text-lg text-emerald-500">+</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </section>
            )}

            {tab === "catalog" && (
              <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <SectionCard
                  title={catalogLabel}
                  subtitle={
                    isShop
                      ? "Inventory cards with stock and pricing at a glance"
                      : "Menu cards that stay readable on mobile and tablet"
                  }
                  action={
                    <button
                      type="button"
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                    >
                      {primaryActionLabel}
                    </button>
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCatalog.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-[1.6rem] border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/5"
                      >
                        <div
                          className={`h-40 rounded-[1.4rem] ${item.accent} bg-gradient-to-br from-white/20 to-white/5`}
                        />
                        <div className="mt-4 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {item.subtitle}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <span>{item.metric}</span>
                          <span className="font-semibold text-slate-950 dark:text-white">
                            {money.format(item.price)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="mt-4 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                        >
                          Edit listing
                        </button>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title={isShop ? "Popular categories" : "Kitchen pace"}
                  subtitle={
                    isShop
                      ? "Sales share by category"
                      : "Orders vs. bookings this week"
                  }
                >
                  {isShop ? (
                    <div className="space-y-6">
                      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-[conic-gradient(from_0deg,#10b981_0_42%,#86efac_42%_77%,#fed7aa_77%_100%)]">
                        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white text-center shadow-lg dark:bg-slate-950">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                              Top
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                              Touring
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Fine Dining", value: "45%" },
                          { label: "Local Tours", value: "35%" },
                          { label: "Souvenirs", value: "20%" },
                        ].map((entry) => (
                          <div
                            key={entry.label}
                            className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                          >
                            <span>{entry.label}</span>
                            <span className="font-semibold">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inventoryBars.map((value, index) => (
                        <div
                          key={index}
                          className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <span>
                              {
                                [
                                  "Orders",
                                  "Bookings",
                                  "Prep",
                                  "Traffic",
                                  "Revenue",
                                  "Return",
                                  "Happy hour",
                                ][index]
                              }
                            </span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/80 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </section>
            )}

            {tab === "orders" && (
              <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <SectionCard
                  title={isShop ? "Fulfillment queue" : "Latest bookings"}
                  subtitle={
                    isShop
                      ? "Process orders before they stack up"
                      : "Confirm reservations and keep the calendar tight"
                  }
                >
                  <div className="space-y-3">
                    {(isShop ? filteredOrders : bookings)
                      .slice(0, 5)
                      .map((entry) => {
                        const isBooking = !isShop;
                        const bookingEntry = entry as BookingItem;
                        const orderEntry = entry as OrderItem;
                        return (
                          <div
                            key={entry.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                          >
                            <div>
                              <p className="font-semibold text-slate-950 dark:text-white">
                                {isBooking
                                  ? bookingEntry.guest
                                  : orderEntry.customer}
                              </p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {isBooking
                                  ? `${bookingEntry.table} • ${bookingEntry.slot}`
                                  : `${orderEntry.items.join(", ")} • ${orderEntry.age}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[entry.status] ?? "bg-slate-500/15 text-slate-600"}`}
                              >
                                {entry.status}
                              </span>
                              <span className="text-sm font-semibold text-slate-950 dark:text-white">
                                {isBooking
                                  ? money.format(bookingEntry.amount)
                                  : money.format(orderEntry.total)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Live stream"
                  subtitle={
                    isShop
                      ? "Inventory and sales pulse"
                      : "Orders and bookings in motion"
                  }
                >
                  <div className="space-y-4">
                    {filteredOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">
                              {order.id}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {order.customer}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status] ?? "bg-slate-500/15 text-slate-600"}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                          {order.items.join(", ")}
                        </p>
                        <p className="mt-3 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                          {money.format(order.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </section>
            )}

            {tab === "analytics" && (
              <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <SectionCard
                  title={
                    isShop ? "Revenue by category" : "Operational insights"
                  }
                  subtitle={
                    isShop
                      ? "A compact view of your best categories"
                      : "Live metrics for service and fulfillment"
                  }
                >
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="grid grid-cols-4 items-end gap-3 h-72">
                        {(isShop ? orderBars : inventoryBars).map(
                          (value, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-2"
                            >
                              <div
                                className="w-full rounded-t-2xl bg-slate-200/70 dark:bg-white/10"
                                style={{ height: `${100 - value}%` }}
                              />
                              <div
                                className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/15"
                                style={{ height: `${value}%`, minHeight: 48 }}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          label: isShop
                            ? "Active listings"
                            : "Orders completed",
                          value: isShop
                            ? catalogItems.length
                            : orders.filter(
                                (order) => order.status === "delivered",
                              ).length,
                        },
                        {
                          label: isShop
                            ? "Items below stock"
                            : "Pending bookings",
                          value: isShop
                            ? catalogItems.filter((item) =>
                                item.status.toLowerCase().includes("low"),
                              ).length
                            : bookings.filter(
                                (booking) => booking.status === "pending",
                              ).length,
                        },
                        {
                          label: isShop ? "Sales target" : "Revenue today",
                          value: isShop ? "75%" : money.format(420000),
                        },
                      ].map((entry) => (
                        <div
                          key={entry.label}
                          className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            {entry.label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                            {entry.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Realtime health"
                  subtitle="Signals that update as the dashboard changes"
                >
                  <div className="space-y-4">
                    {[
                      { label: "Live updates", value: notificationCount },
                      {
                        label: "Search results",
                        value: filteredCatalog.length,
                      },
                      {
                        label: "Open orders",
                        value: filteredOrders.filter(
                          (order) => order.status !== "delivered",
                        ).length,
                      },
                    ].map((entry) => (
                      <div
                        key={entry.label}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                          {entry.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                          {entry.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </section>
            )}

            {tab === "settings" && (
              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard
                  title="Business settings"
                  subtitle="Edit the vendor profile and switch between restaurant or shop mode"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Owner name
                      </span>
                      <input
                        value={profile.ownerName}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            ownerName: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Email
                      </span>
                      <input
                        value={profile.email}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Phone
                      </span>
                      <input
                        value={profile.phone}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Business name
                      </span>
                      <input
                        value={business.businessName}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessName: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Location
                      </span>
                      <input
                        value={business.location}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            location: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Opening hours
                      </span>
                      <input
                        value={business.openingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            openingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300 sm:col-span-2">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Description
                      </span>
                      <textarea
                        value={business.description}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => applyBusinessType("Restaurant")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                    >
                      Switch to restaurant view
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBusinessType("Shop")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                    >
                      Switch to shop view
                    </button>
                    <button
                      type="button"
                      onClick={toggleDark}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      Toggle theme
                    </button>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Realtime summary"
                  subtitle="A compact readout of the current dashboard state"
                >
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Mode
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {business.businessType} vendor
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Live notifications
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {notificationCount} unread
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Search
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {searchQuery || "Nothing filtered"}
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
