import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

type Tab = "overview" | "profile" | "business" | "menu" | "bookings" | "orders";
type Booking = { id: number; visitor: string; table: string; date: string; time: string; status: "pending" | "confirmed" | "cancelled" };
type Order = { id: string; visitor: string; items: string[]; total: number; status: "pending" | "processing" | "delivered" };
type MenuItem = { id: number; name: string; category: string; price: number; description: string; available: boolean };
type VendorProfile = { ownerName: string; email: string; phone: string; description: string };
type BusinessCategory = "African" | "Asian" | "Rwandan" | "American";
type StoredUpload = { name: string; type: string; size: number; dataUrl?: string };
type BusinessInfo = {
  businessName: string;
  businessType: "Restaurant" | "Shop";
  location: string;
  openingHours: string;
  businessEmail: string;
  businessPhone: string;
  managerName: string;
  managerEmail: string;
  website: string;
  categories: BusinessCategory[];
  tablesCount: number;
  capacity: number;
  menuPdf?: StoredUpload;
  rdbCertificate?: StoredUpload;
  profileImage?: StoredUpload;
};

const businessCategoryOptions: { value: BusinessCategory; label: string }[] = [
  { value: "African", label: "African" },
  { value: "Asian", label: "Asia" },
  { value: "Rwandan", label: "Rwanda" },
  { value: "American", label: "America" },
];

const MAX_INLINE_UPLOAD_BYTES = 450_000;

const initialBookings: Booking[] = [
  { id: 1, visitor: "Alice Uwase", table: "T2", date: "2025-07-15", time: "19:00", status: "confirmed" },
  { id: 2, visitor: "Jean Pierre", table: "T4", date: "2025-07-16", time: "12:30", status: "pending" },
];

const initialOrders: Order[] = [
  { id: "ORD-010", visitor: "Alice Uwase", items: ["Grilled Tilapia", "Matoke"], total: 17000, status: "pending" },
  { id: "ORD-011", visitor: "Marie Claire", items: ["Brochettes"], total: 8000, status: "processing" },
];

const initialMenu: MenuItem[] = [
  { id: 1, name: "Grilled Tilapia", category: "Main", price: 12000, description: "Fresh tilapia grilled with local spices.", available: true },
  { id: 2, name: "Brochettes", category: "Snack", price: 8000, description: "Beef skewers with sweet and spicy sauce.", available: true },
  { id: 3, name: "Isombe", category: "Side", price: 6000, description: "Cassava leaves cooked with peanut butter.", available: true },
];

export default function VendorDashboard() {
  const { user } = useApp();

  const storageKey = useMemo(() => (user ? `enjoy-rwanda.vendorDashboard.v1.${user.id}` : null), [user]);
  const storedState = useMemo(() => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<{
        profile: VendorProfile;
        business: BusinessInfo;
        bookings: Booking[];
        orders: Order[];
        menuItems: MenuItem[];
        tab: Tab;
      }>;

      const normalizedMenuItems = Array.isArray(parsed.menuItems)
        ? parsed.menuItems.map((item) => ({ ...item, available: item.available ?? true }))
        : undefined;

      const normalizeCategories = (input: unknown): BusinessCategory[] => {
        if (Array.isArray(input)) {
          return input.filter((entry): entry is BusinessCategory => typeof entry === "string" && businessCategoryOptions.some((o) => o.value === entry));
        }
        if (typeof input === "string") {
          const normalized = input
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean);
          const mapped: BusinessCategory[] = [];
          for (const value of normalized) {
            if (value === "african") mapped.push("African");
            if (value === "asia" || value === "asian") mapped.push("Asian");
            if (value === "rwanda" || value === "rwandan") mapped.push("Rwandan");
            if (value === "america" || value === "american") mapped.push("American");
          }
          return Array.from(new Set(mapped));
        }
        return [];
      };

      const rawBusiness = parsed.business as Partial<BusinessInfo> & { contactPhone?: string; categories?: unknown; businessType?: string } | undefined;
      const normalizedBusiness = rawBusiness
        ? ({
            ...rawBusiness,
            businessType: rawBusiness.businessType === "Shop" ? "Shop" : "Restaurant",
            businessPhone: rawBusiness.businessPhone ?? rawBusiness.contactPhone ?? "",
            businessEmail: rawBusiness.businessEmail ?? "",
            managerName: rawBusiness.managerName ?? "",
            managerEmail: rawBusiness.managerEmail ?? "",
            location: rawBusiness.location ?? "Kigali, Rwanda",
            openingHours: rawBusiness.openingHours ?? "08:00 - 22:00",
            website: rawBusiness.website ?? "",
            businessName: rawBusiness.businessName ?? "",
            categories: normalizeCategories(rawBusiness.categories),
            tablesCount: typeof rawBusiness.tablesCount === "number" ? rawBusiness.tablesCount : 0,
            capacity: typeof rawBusiness.capacity === "number" ? rawBusiness.capacity : 0,
          } satisfies BusinessInfo)
        : undefined;

      return { ...parsed, menuItems: normalizedMenuItems, business: normalizedBusiness ?? parsed.business };
    } catch {
      return null;
    }
  }, [storageKey]);

  const [tab, setTab] = useState<Tab>(() => storedState?.tab ?? "overview");
  const [setupStep, setSetupStep] = useState<"welcome" | "profile" | "business">("welcome");
  const [profile, setProfile] = useState<VendorProfile>(() => storedState?.profile ?? ({
    ownerName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    description: "I run a restaurant that celebrates Rwandan hospitality.",
  }));
  const [business, setBusiness] = useState<BusinessInfo>(() => storedState?.business ?? ({
    businessName: "",
    businessType: "Restaurant",
    location: "Kigali, Rwanda",
    openingHours: "08:00 - 22:00",
    businessEmail: "",
    businessPhone: "",
    managerName: "",
    managerEmail: "",
    website: "",
    categories: ["Rwandan"],
    tablesCount: 0,
    capacity: 0,
  }));
  const [bookings, setBookings] = useState<Booking[]>(() => storedState?.bookings ?? initialBookings);
  const [orders, setOrders] = useState<Order[]>(() => storedState?.orders ?? initialOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => storedState?.menuItems ?? initialMenu);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", category: "Main", price: "", description: "", available: true });
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState<"All" | MenuItem["category"]>("All");
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingMenuDraft, setEditingMenuDraft] = useState({ name: "", category: "Main", price: "", description: "", available: true });

  const accountReady = useMemo(
    () =>
      profile.phone.trim().length > 0 &&
      business.businessName.trim().length > 0 &&
      business.businessPhone.trim().length > 0 &&
      business.businessEmail.trim().length > 0,
    [profile.phone, business.businessName, business.businessEmail, business.businessPhone]
  );

  const onboardingProgress = setupStep === "welcome" ? 25 : setupStep === "profile" ? 60 : 100;

  const handleProfileSave = () => setSetupStep("business");
  const handleBusinessSave = () => setTab("overview");

  const toggleBusinessCategory = (category: BusinessCategory) => {
    setBusiness((prev) => {
      const hasCategory = prev.categories.includes(category);
      return { ...prev, categories: hasCategory ? prev.categories.filter((entry) => entry !== category) : [...prev.categories, category] };
    });
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const buildStoredUpload = async (file: File): Promise<StoredUpload> => {
    const base: StoredUpload = { name: file.name, type: file.type || "application/octet-stream", size: file.size };
    if (file.size <= MAX_INLINE_UPLOAD_BYTES) {
      return { ...base, dataUrl: await readFileAsDataUrl(file) };
    }
    return base;
  };

  const updateBusinessUpload = async (field: "menuPdf" | "rdbCertificate" | "profileImage", file: File) => {
    const upload = await buildStoredUpload(file);
    setBusiness((prev) => ({ ...prev, [field]: upload }));
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) return;
    setMenuItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newMenuItem.name,
        category: newMenuItem.category,
        price: Number(newMenuItem.price),
        description: newMenuItem.description,
        available: newMenuItem.available,
      },
    ]);
    setNewMenuItem({ name: "", category: "Main", price: "", description: "", available: true });
  };

  useEffect(() => {
    if (!storageKey) return;
    const payload = JSON.stringify({ profile, business, bookings, orders, menuItems, tab });
    localStorage.setItem(storageKey, payload);
  }, [storageKey, profile, business, bookings, orders, menuItems, tab]);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "pending").length, [bookings]);
  const processingOrders = useMemo(() => orders.filter((o) => o.status !== "delivered").length, [orders]);
  const deliveredRevenue = useMemo(() => orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0), [orders]);

  const menuCategories = useMemo(() => {
    const categories = Array.from(new Set(menuItems.map((item) => item.category))).sort();
    return ["All", ...categories] as const;
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const search = menuSearch.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesSearch =
        search.length === 0 ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);
      const matchesCategory = menuCategory === "All" ? true : item.category === menuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearch, menuCategory]);

  const tabItems = useMemo<{ value: Tab; label: string; badge?: number }[]>(
    () => [
      { value: "overview", label: "Overview" },
      { value: "profile", label: "Profile" },
      { value: "business", label: "Business" },
      { value: "menu", label: "Menu", badge: menuItems.length },
      { value: "bookings", label: "Bookings", badge: pendingBookings },
      { value: "orders", label: "Orders", badge: processingOrders },
    ],
    [menuItems.length, pendingBookings, processingOrders]
  );

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setEditingMenuDraft({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      available: item.available,
    });
  };

  const closeEditMenuItem = () => {
    setEditingMenuId(null);
    setEditingMenuDraft({ name: "", category: "Main", price: "", description: "", available: true });
  };

  const saveEditedMenuItem = () => {
    if (!editingMenuId) return;
    if (!editingMenuDraft.name.trim() || !editingMenuDraft.price) return;
    setMenuItems((prev) =>
      prev.map((entry) =>
        entry.id === editingMenuId
          ? {
              ...entry,
              name: editingMenuDraft.name.trim(),
              category: editingMenuDraft.category,
              price: Number(editingMenuDraft.price),
              description: editingMenuDraft.description,
              available: editingMenuDraft.available,
            }
          : entry
      )
    );
    closeEditMenuItem();
  };

  if (!user || user.role !== "vendor")
    return (
      <div className="p-10 text-center">
        Access denied. <Link to="/login" className="text-blue-600 underline">Login as vendor</Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-8 py-10 text-white shadow-xl shadow-slate-200/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Vendor dashboard</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight">Welcome back, {user.name}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">Everything you need to manage your restaurant or shop in one place. Review bookings, publish menu items, and keep your business details up to date.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">Role: Vendor</div>
              <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">Status: {accountReady ? "Ready" : "Setup required"}</div>
            </div>
          </div>
          <div className="mt-8 rounded-3xl bg-white/10 p-5">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-200">
              <span>Account setup progress</span>
              <span>{onboardingProgress}% complete</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${onboardingProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {!accountReady ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Vendor onboarding</p>
                  <h2 className="text-2xl font-bold text-gray-900">Finish your account setup</h2>
                </div>
                <span className="text-xs font-semibold bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full">Step {setupStep === "welcome" ? 1 : setupStep === "profile" ? 2 : 3} of 3</span>
              </div>
              <p className="text-gray-500 leading-relaxed">Complete your profile and business details so you can start accepting bookings, selling products, and managing customer orders.</p>
              <div className="mt-6 grid gap-3">
                <button onClick={() => setSetupStep("profile")} className={`w-full text-left rounded-2xl px-5 py-4 border ${setupStep === "profile" ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"}`}>
                  <p className="font-semibold">Profile details</p>
                  <p className="text-sm text-gray-500">Owner name, contact phone, description.</p>
                </button>
                <button onClick={() => setSetupStep("business")} className={`w-full text-left rounded-2xl px-5 py-4 border ${setupStep === "business" ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"}`}>
                  <p className="font-semibold">Business information</p>
                  <p className="text-sm text-gray-500">Business name, type, location, opening hours.</p>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick start</h3>
              <ul className="space-y-3 text-sm text-gray-600 list-disc pl-5">
                <li>Add your restaurant or shop details.</li>
                <li>Upload your menu or product catalog.</li>
                <li>Confirm bookings and update order status.</li>
              </ul>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Ready to accept bookings</p>
                  <p className="text-xs text-green-600">Complete setup to unlock your management dashboard.</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">Keep your profile updated</p>
                  <p className="text-xs text-blue-600">Review menu items and order flow daily.</p>
                </div>
              </div>
            </div>
          </div>

          {setupStep === "welcome" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Welcome, {user.name}</h3>
              <p className="text-gray-500 mb-5">Start by entering your profile information. Then complete your business details to finish onboarding.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setSetupStep("profile")} className="rounded-2xl bg-[#1a1a2e] text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800">Start Profile</button>
                <button onClick={() => setSetupStep("business")} className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300">Skip to Business</button>
              </div>
            </div>
          )}

          {setupStep === "profile" && (
            <form className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Profile setup</p>
                  <h3 className="text-xl font-bold text-gray-900">Owner profile</h3>
                </div>
                <span className="text-xs text-gray-500">Complete this first</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Owner name</span>
                  <input value={profile.ownerName} onChange={(e) => setProfile((prev) => ({ ...prev, ownerName: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Email address</span>
                  <input value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Contact phone</span>
                  <input value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Business description</span>
                  <textarea value={profile.description} onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300 resize-none" />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleProfileSave} className="rounded-2xl bg-[#1a1a2e] text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800">Save & Continue</button>
                <button type="button" onClick={() => setSetupStep("business")} className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300">Continue without saving</button>
              </div>
            </form>
          )}

          {setupStep === "business" && (
            <form className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Business setup</p>
                  <h3 className="text-xl font-bold text-gray-900">Business information</h3>
                </div>
                <span className="text-xs text-gray-500">Essential for public listing</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Business name</span>
                  <input value={business.businessName} onChange={(e) => setBusiness((prev) => ({ ...prev, businessName: e.target.value }))} placeholder="Example: Kigali Flavors" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Business type</span>
                  <select value={business.businessType} onChange={(e) => setBusiness((prev) => ({ ...prev, businessType: e.target.value as BusinessInfo["businessType"] }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300">
                    <option value="Restaurant">Restaurant</option>
                    <option value="Shop">Shop</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Location</span>
                  <input value={business.location} onChange={(e) => setBusiness((prev) => ({ ...prev, location: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Business phone</span>
                  <input value={business.businessPhone} onChange={(e) => setBusiness((prev) => ({ ...prev, businessPhone: e.target.value }))} placeholder="+250 7XX XXX XXX" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Business email</span>
                  <input value={business.businessEmail} onChange={(e) => setBusiness((prev) => ({ ...prev, businessEmail: e.target.value }))} type="email" placeholder="info@yourbusiness.com" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Opening hours</span>
                  <input value={business.openingHours} onChange={(e) => setBusiness((prev) => ({ ...prev, openingHours: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Manager name</span>
                  <input value={business.managerName} onChange={(e) => setBusiness((prev) => ({ ...prev, managerName: e.target.value }))} placeholder="Content / manager contact" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Manager email</span>
                  <input value={business.managerEmail} onChange={(e) => setBusiness((prev) => ({ ...prev, managerEmail: e.target.value }))} type="email" placeholder="manager@yourbusiness.com" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Website URL</span>
                  <input value={business.website} onChange={(e) => setBusiness((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Number of tables</span>
                  <input value={business.tablesCount} onChange={(e) => setBusiness((prev) => ({ ...prev, tablesCount: Number(e.target.value) }))} type="number" min={0} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span>Capacity (people you can host)</span>
                  <input value={business.capacity} onChange={(e) => setBusiness((prev) => ({ ...prev, capacity: Number(e.target.value) }))} type="number" min={0} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900">Categories</p>
                  <p className="text-xs text-gray-500 mt-1">Choose the cuisine/region tags for your business.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {businessCategoryOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={business.categories.includes(option.value)} onChange={() => toggleBusinessCategory(option.value)} className="h-4 w-4" />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Uploads</p>
                  <p className="text-xs text-gray-500 mt-1">Small files (≤ {Math.round(MAX_INLINE_UPLOAD_BYTES / 1000)}KB) are stored for preview; larger files store name only.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">Business profile image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void updateBusinessUpload("profileImage", file);
                      }}
                      className="w-full text-sm"
                    />
                    {business.profileImage && (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                        <span className="truncate">{business.profileImage.name}</span>
                        <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, profileImage: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                      </div>
                    )}
                    {business.profileImage?.dataUrl && (
                      <img alt="Business profile" src={business.profileImage.dataUrl} className="mt-2 h-24 w-24 rounded-2xl object-cover border border-gray-200" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">PDF menu</p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void updateBusinessUpload("menuPdf", file);
                      }}
                      className="w-full text-sm"
                    />
                    {business.menuPdf && (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                        <span className="truncate">{business.menuPdf.name}</span>
                        <div className="flex items-center gap-2">
                          {business.menuPdf.dataUrl && <a href={business.menuPdf.dataUrl} download={business.menuPdf.name} className="font-semibold text-slate-900 hover:underline">Download</a>}
                          <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, menuPdf: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">RDB certificate</p>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void updateBusinessUpload("rdbCertificate", file);
                    }}
                    className="w-full text-sm"
                  />
                  {business.rdbCertificate && (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="truncate">{business.rdbCertificate.name}</span>
                      <div className="flex items-center gap-2">
                        {business.rdbCertificate.dataUrl && <a href={business.rdbCertificate.dataUrl} download={business.rdbCertificate.name} className="font-semibold text-slate-900 hover:underline">Download</a>}
                        <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, rdbCertificate: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleBusinessSave} className="rounded-2xl bg-[#1a1a2e] text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800">Save Business Info</button>
                <button type="button" onClick={() => setTab("menu")} className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300">Finish later</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4">
              {business.profileImage?.dataUrl ? (
                <img alt="Business profile" src={business.profileImage.dataUrl} className="h-12 w-12 rounded-2xl object-cover border border-gray-200" />
              ) : (
                <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-xs font-black text-slate-700">
                  {business.businessName?.trim() ? business.businessName.trim().slice(0, 2).toUpperCase() : "RW"}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.businessName || user.name} management</h2>
                <p className="text-gray-500">Use the tabs below to update profiles, manage bookings, and publish menu items.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-white px-4 py-4 text-center shadow-sm">
                <p className="text-sm text-gray-500">Bookings</p>
                <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white px-4 py-4 text-center shadow-sm">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white px-4 py-4 text-center shadow-sm">
                <p className="text-sm text-gray-500">Menu items</p>
                <p className="text-xl font-bold text-gray-900">{menuItems.length}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Bookings", value: bookings.length, color: "bg-slate-900 text-white" },
                { label: "Orders", value: orders.length, color: "bg-slate-900 text-white" },
                { label: "Menu items", value: menuItems.length, color: "bg-slate-100 text-slate-900" },
                { label: "Status", value: accountReady ? "Live" : "Draft", color: accountReady ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700" },
              ].map((card) => (
                <div key={card.label} className={`rounded-[1.5rem] p-5 shadow-sm ${card.color}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">{card.label}</span>
                  </div>
                  <p className="mt-6 text-3xl font-black">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 rounded-[1.5rem] p-3 shadow-sm mb-8">
            {tabItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                  tab === item.value ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span>{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === item.value ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">At a glance</h3>
                      <p className="text-sm text-gray-500">Quick snapshot of what needs attention right now.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setTab("menu")} className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">Add menu item</button>
                      <button onClick={() => setTab("bookings")} className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-blue-300">Review bookings</button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Pending bookings</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{pendingBookings}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Open orders</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{processingOrders}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Delivered revenue</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{deliveredRevenue.toLocaleString()} RWF</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Business summary</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">{business.businessName || "Not set"}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{business.location}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-gray-500">Hours</p>
                      <p className="font-semibold text-gray-900">{business.openingHours}</p>
                    </div>
                  </div>
                  <button onClick={() => setTab("business")} className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300">Update business info</button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Latest bookings</h3>
                      <p className="text-sm text-gray-500">Confirm reservations and keep your schedule updated.</p>
                    </div>
                    <button onClick={() => setTab("bookings")} className="text-sm font-semibold text-slate-900 hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.visitor}</p>
                            <p className="text-sm text-gray-500">Table {booking.table} • {booking.date} at {booking.time}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${booking.status === "confirmed" ? "bg-green-50 text-green-700" : booking.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.status === "pending" && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => setBookings((prev) => prev.map((entry) => entry.id === booking.id ? { ...entry, status: "confirmed" } : entry))} className="rounded-2xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600">Confirm</button>
                            <button onClick={() => setBookings((prev) => prev.map((entry) => entry.id === booking.id ? { ...entry, status: "cancelled" } : entry))} className="rounded-2xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">Cancel</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Latest orders</h3>
                      <p className="text-sm text-gray-500">Track order progress and mark orders as delivered.</p>
                    </div>
                    <button onClick={() => setTab("orders")} className="text-sm font-semibold text-slate-900 hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.visitor} • {order.total.toLocaleString()} RWF</p>
                            <p className="text-sm text-gray-500">{order.items.join(", ")}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.status === "delivered" ? "bg-green-50 text-green-700" : order.status === "processing" ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-3">
                          {order.status === "pending" ? (
                            <button onClick={() => setOrders((prev) => prev.map((entry) => entry.id === order.id ? { ...entry, status: "processing" } : entry))} className="rounded-2xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600">Process</button>
                          ) : order.status === "processing" ? (
                            <button onClick={() => setOrders((prev) => prev.map((entry) => entry.id === order.id ? { ...entry, status: "delivered" } : entry))} className="rounded-2xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600">Deliver</button>
                          ) : (
                            <span className="text-xs text-gray-500">Completed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Vendor profile</h3>
                <div className="space-y-5">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Owner name</span>
                    <input value={profile.ownerName} onChange={(e) => setProfile((prev) => ({ ...prev, ownerName: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Email</span>
                    <input value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Phone</span>
                    <input value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Description</span>
                    <textarea value={profile.description} onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300 resize-none" />
                  </label>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Quick summary</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Owner</p>
                    <p className="font-semibold text-gray-900">{profile.ownerName}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Contact</p>
                    <p className="font-semibold text-gray-900">{profile.phone || "Not set"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "business" && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Business information</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Business name</span>
                      <input value={business.businessName} onChange={(e) => setBusiness((prev) => ({ ...prev, businessName: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Type</span>
                      <select value={business.businessType} onChange={(e) => setBusiness((prev) => ({ ...prev, businessType: e.target.value as BusinessInfo["businessType"] }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300">
                        <option value="Restaurant">Restaurant</option>
                        <option value="Shop">Shop</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Location</span>
                      <input value={business.location} onChange={(e) => setBusiness((prev) => ({ ...prev, location: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Business phone</span>
                      <input value={business.businessPhone} onChange={(e) => setBusiness((prev) => ({ ...prev, businessPhone: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Business email</span>
                      <input value={business.businessEmail} onChange={(e) => setBusiness((prev) => ({ ...prev, businessEmail: e.target.value }))} type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Opening hours</span>
                      <input value={business.openingHours} onChange={(e) => setBusiness((prev) => ({ ...prev, openingHours: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Manager name</span>
                      <input value={business.managerName} onChange={(e) => setBusiness((prev) => ({ ...prev, managerName: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Manager email</span>
                      <input value={business.managerEmail} onChange={(e) => setBusiness((prev) => ({ ...prev, managerEmail: e.target.value }))} type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Website URL</span>
                      <input value={business.website} onChange={(e) => setBusiness((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Number of tables</span>
                      <input value={business.tablesCount} onChange={(e) => setBusiness((prev) => ({ ...prev, tablesCount: Number(e.target.value) }))} type="number" min={0} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Capacity (people you can host)</span>
                      <input value={business.capacity} onChange={(e) => setBusiness((prev) => ({ ...prev, capacity: Number(e.target.value) }))} type="number" min={0} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900">Categories</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {businessCategoryOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={business.categories.includes(option.value)} onChange={() => toggleBusinessCategory(option.value)} className="h-4 w-4" />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Uploads</p>
                      <p className="text-xs text-gray-500 mt-1">Small files (≤ {Math.round(MAX_INLINE_UPLOAD_BYTES / 1000)}KB) are stored for preview; larger files store name only.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">Business profile image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void updateBusinessUpload("profileImage", file);
                          }}
                          className="w-full text-sm"
                        />
                        {business.profileImage && (
                          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                            <span className="truncate">{business.profileImage.name}</span>
                            <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, profileImage: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                          </div>
                        )}
                        {business.profileImage?.dataUrl && (
                          <img alt="Business profile" src={business.profileImage.dataUrl} className="mt-2 h-24 w-24 rounded-2xl object-cover border border-gray-200" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">PDF menu</p>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void updateBusinessUpload("menuPdf", file);
                          }}
                          className="w-full text-sm"
                        />
                        {business.menuPdf && (
                          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                            <span className="truncate">{business.menuPdf.name}</span>
                            <div className="flex items-center gap-2">
                              {business.menuPdf.dataUrl && <a href={business.menuPdf.dataUrl} download={business.menuPdf.name} className="font-semibold text-slate-900 hover:underline">Download</a>}
                              <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, menuPdf: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">RDB certificate</p>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void updateBusinessUpload("rdbCertificate", file);
                        }}
                        className="w-full text-sm"
                      />
                      {business.rdbCertificate && (
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                          <span className="truncate">{business.rdbCertificate.name}</span>
                          <div className="flex items-center gap-2">
                            {business.rdbCertificate.dataUrl && <a href={business.rdbCertificate.dataUrl} download={business.rdbCertificate.name} className="font-semibold text-slate-900 hover:underline">Download</a>}
                            <button type="button" onClick={() => setBusiness((prev) => ({ ...prev, rdbCertificate: undefined }))} className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-blue-300">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Business summary</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">{business.businessName || "Not set"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Type</p>
                    <p className="font-semibold text-gray-900">{business.businessType}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{business.location}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Hours</p>
                    <p className="font-semibold text-gray-900">{business.openingHours}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Business contact</p>
                    <p className="font-semibold text-gray-900">{business.businessEmail || "Not set"}</p>
                    <p className="text-sm text-gray-700">{business.businessPhone || "Not set"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Manager</p>
                    <p className="font-semibold text-gray-900">{business.managerName || "Not set"}</p>
                    <p className="text-sm text-gray-700">{business.managerEmail || "Not set"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-semibold text-gray-900">{business.tablesCount} tables • {business.capacity} people</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Categories</p>
                    <p className="font-semibold text-gray-900">{business.categories.length ? business.categories.join(", ") : "Not set"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-gray-500">Uploads</p>
                    <p className="font-semibold text-gray-900">Menu PDF: {business.menuPdf ? business.menuPdf.name : "Not uploaded"}</p>
                    <p className="text-sm text-gray-700">RDB certificate: {business.rdbCertificate ? business.rdbCertificate.name : "Not uploaded"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "menu" && (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Menu / Products</h3>
                    <p className="text-sm text-gray-500">Add, edit, and remove items that appear to your customers.</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{menuItems.length} items</span>
                </div>
                <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Search</span>
                    <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Search items…" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Category</span>
                    <select value={menuCategory} onChange={(e) => setMenuCategory(e.target.value as typeof menuCategory)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300">
                      {menuCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="space-y-3">
                  {filteredMenuItems.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-gray-100 p-4 hover:border-blue-200 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}{item.available ? "" : " • Hidden"}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.price.toLocaleString()} RWF</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">{item.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => setMenuItems((prev) => prev.filter((entry) => entry.id !== item.id))} className="rounded-2xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600">Delete</button>
                        <button onClick={() => openEditMenuItem(item)} className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-blue-300">Edit</button>
                        <button onClick={() => setMenuItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, available: !entry.available } : entry))} className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-blue-300">
                          {item.available ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredMenuItems.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
                      No items match your filters.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Add new item</h3>
                <div className="space-y-4">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Item name</span>
                    <input value={newMenuItem.name} onChange={(e) => setNewMenuItem((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Category</span>
                    <select value={newMenuItem.category} onChange={(e) => setNewMenuItem((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300">
                      <option>Main</option>
                      <option>Snack</option>
                      <option>Side</option>
                      <option>Drink</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Price (RWF)</span>
                    <input value={newMenuItem.price} onChange={(e) => setNewMenuItem((prev) => ({ ...prev, price: e.target.value }))} type="number" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Description</span>
                    <textarea value={newMenuItem.description} onChange={(e) => setNewMenuItem((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300 resize-none" />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <span className="font-semibold">Visible to customers</span>
                    <input type="checkbox" checked={newMenuItem.available} onChange={(e) => setNewMenuItem((prev) => ({ ...prev, available: e.target.checked }))} className="h-4 w-4" />
                  </label>
                  <button type="button" onClick={handleAddMenuItem} className="w-full rounded-2xl bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save item</button>
                </div>
              </div>
            </div>
          )}

          {editingMenuId !== null && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
              <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Edit item</p>
                    <h3 className="text-xl font-bold text-gray-900">Update menu details</h3>
                  </div>
                  <button onClick={closeEditMenuItem} className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300">Close</button>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Item name</span>
                    <input value={editingMenuDraft.name} onChange={(e) => setEditingMenuDraft((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Category</span>
                      <select value={editingMenuDraft.category} onChange={(e) => setEditingMenuDraft((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300">
                        <option>Main</option>
                        <option>Snack</option>
                        <option>Side</option>
                        <option>Drink</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span>Price (RWF)</span>
                      <input value={editingMenuDraft.price} onChange={(e) => setEditingMenuDraft((prev) => ({ ...prev, price: e.target.value }))} type="number" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300" />
                    </label>
                  </div>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span>Description</span>
                    <textarea value={editingMenuDraft.description} onChange={(e) => setEditingMenuDraft((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-300 resize-none" />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <span className="font-semibold">Visible to customers</span>
                    <input type="checkbox" checked={editingMenuDraft.available} onChange={(e) => setEditingMenuDraft((prev) => ({ ...prev, available: e.target.checked }))} className="h-4 w-4" />
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={saveEditedMenuItem} className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save changes</button>
                  <button onClick={closeEditMenuItem} className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-5 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bookings</h3>
                  <p className="text-sm text-gray-500">Confirm reservations and keep your schedule updated.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{bookings.length} total</span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-gray-500">
                  <tr>
                    {["Visitor", "Table", "Date", "Time", "Status", "Actions"].map((label) => (
                      <th key={label} className="pb-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-4">{booking.visitor}</td>
                      <td>{booking.table}</td>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${booking.status === "confirmed" ? "bg-green-50 text-green-700" : booking.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="space-x-2">
                        {booking.status === "pending" ? (
                          <>
                            <button onClick={() => setBookings((prev) => prev.map((entry) => entry.id === booking.id ? { ...entry, status: "confirmed" } : entry))} className="rounded-2xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600">Confirm</button>
                            <button onClick={() => setBookings((prev) => prev.map((entry) => entry.id === booking.id ? { ...entry, status: "cancelled" } : entry))} className="rounded-2xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">Cancel</button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "orders" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-5 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Orders</h3>
                  <p className="text-sm text-gray-500">Track order progress and mark orders as delivered.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{orders.length} total</span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-gray-500">
                  <tr>
                    {["Order ID", "Visitor", "Items", "Total", "Status", "Actions"].map((label) => (
                      <th key={label} className="pb-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-4">{order.id}</td>
                      <td>{order.visitor}</td>
                      <td>{order.items.join(", ")}</td>
                      <td>{order.total.toLocaleString()} RWF</td>
                      <td>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.status === "delivered" ? "bg-green-50 text-green-700" : order.status === "processing" ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === "pending" ? (
                          <button onClick={() => setOrders((prev) => prev.map((entry) => entry.id === order.id ? { ...entry, status: "processing" } : entry))} className="rounded-2xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600">Process</button>
                        ) : order.status === "processing" ? (
                          <button onClick={() => setOrders((prev) => prev.map((entry) => entry.id === order.id ? { ...entry, status: "delivered" } : entry))} className="rounded-2xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600">Deliver</button>
                        ) : (
                          <span className="text-xs text-gray-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
