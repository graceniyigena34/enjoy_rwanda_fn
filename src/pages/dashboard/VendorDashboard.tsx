import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import ReservationPage from "./ReservationPage";
import PhoneNumberInput from "../../components/forms/PhoneNumberInput";
import {
  BASE_URL,
  type BusinessDocumentRecord,
  createBusinessProfile,
  createManager,
  createMenuItem,
  deleteBusinessSupportingDocument,
  deleteManager,
  getMenuItems,
  getMyManagers,
  getMyBusinessProfile,
  getRestaurantTypes,
  getShopTypes,
  getVendorBookings,
  updateBookingStatus,
  updateManager,
  updateMyBusinessProfile,
  type BusinessManagerRecord,
  type BookingRecord,
  type BusinessProfileRecord,
  type MenuItemRecord,
  type RestaurantTypeRecord,
  type ShopTypeRecord,
  type SupportingDocumentInput,
} from "../../utils/api";

type BusinessType = "Restaurant" | "Shop";
type Tab =
  | "overview"
  | "catalog"
  | "orders"
  | "bookings"
  | "reservation"
  | "analytics"
  | "settings";
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

type SupportingDocumentDraft = {
  id: string;
  file: File;
  documentType: string;
  description: string;
};

type BusinessInfo = {
  businessName: string;
  businessType: BusinessType;
  location: string;
  openingHours: string;
  closingHours: string;
  weekendOpeningHours: string;
  weekendClosingHours: string;
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
  imageUrl?: string;
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

type NewItemFormState = {
  itemName: string;
  price: string;
  prepTime: string;
  description: string;
  imageName: string;
  imagePreviewUrl?: string;
  imageFile?: File | null;
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

const createBlankSeed = (businessType: BusinessType): DashboardSeed => ({
  profile: {
    ownerName: "",
    email: "",
    phone: "",
  },
  business: {
    businessName: "",
    businessType,
    location: "",
    openingHours: "",
    closingHours: "",
    weekendOpeningHours: "",
    weekendClosingHours: "",
    openingDays: [],
    businessPhone: "",
    businessEmail: "",
    managerName: "",
    managerEmail: "",
    description: "",
  },
  catalogItems: [],
  bookings: [],
  orders: [],
  notifications: [],
});

const chartSeries = {
  Restaurant: [18, 22, 25, 42, 38, 19, 41],
  Shop: [22, 18, 31, 28, 40, 35, 44],
};

const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

const toneClasses: Record<NotificationTone, string> = {
  emerald: "bg-[#1a1a2e]/15 text-[#1a1a2e] dark:text-[#1a1a2e]",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

const statusClasses: Record<string, string> = {
  confirmed: "bg-[#1a1a2e]/15 text-[#1a1a2e] dark:text-[#1a1a2e]",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  processing: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  delivered: "bg-[#1a1a2e]/15 text-[#1a1a2e] dark:text-[#1a1a2e]",
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
  if (tab === "bookings") {
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
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
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
  const { user, token, logout, darkMode, toggleDark } = useApp();
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
    () => createBlankSeed(storedState?.business?.businessType ?? "Restaurant"),
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
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() =>
    Boolean(storedState?.onboardingComplete),
  );
  const [hasRemoteBusinessProfile, setHasRemoteBusinessProfile] =
    useState(false);
  const [profileHydrating, setProfileHydrating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<ProfileInfo>(
    () => storedState?.profile ?? initialSeed.profile,
  );
  const [business, setBusiness] = useState<BusinessInfo>(() => ({
    ...initialSeed.business,
    ...(storedState?.business ?? {}),
  }));
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
  const [availabilityByItemId, setAvailabilityByItemId] = useState<
    Record<number, boolean>
  >(() =>
    Object.fromEntries(
      (storedState?.catalogItems ?? initialSeed.catalogItems).map((item) => [
        item.id,
        !item.status.toLowerCase().includes("low"),
      ]),
    ),
  );
  const [vendorBookings, setVendorBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null,
  );
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [menuFormMessage, setMenuFormMessage] = useState<string | null>(null);
  const [menuFormMessageType, setMenuFormMessageType] = useState<
    "success" | "error"
  >("success");
  const [menuFormSubmitting, setMenuFormSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businessFiles, setBusinessFiles] = useState<{
    businessProfileImage: File | null;
    rdbCertificate: File | null;
  }>({
    businessProfileImage: null,
    rdbCertificate: null,
  });
  const [supportingDocuments, setSupportingDocuments] = useState<
    SupportingDocumentDraft[]
  >([]);
  const [savedSupportingDocuments, setSavedSupportingDocuments] = useState<
    BusinessDocumentRecord[]
  >([]);
  const [deletingSavedDocumentId, setDeletingSavedDocumentId] = useState<
    number | null
  >(null);
  const [supportingDocsSubmitting, setSupportingDocsSubmitting] =
    useState(false);
  const [supportingDocsMessage, setSupportingDocsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [menuForm, setMenuForm] = useState<NewItemFormState>({
    itemName: "",
    price: "",
    prepTime: "",
    description: "",
    imageName: "",
    imagePreviewUrl: undefined,
    imageFile: null,
  });
  const [managerActionMessage, setManagerActionMessage] = useState<
    string | null
  >(null);
  const [managerActionMessageType, setManagerActionMessageType] = useState<
    "success" | "error"
  >("success");
  const [restaurantTypes, setRestaurantTypes] = useState<
    RestaurantTypeRecord[]
  >([]);
  const [restaurantTypesLoading, setRestaurantTypesLoading] = useState(false);
  const [restaurantTypesError, setRestaurantTypesError] = useState<
    string | null
  >(null);
  const [shopTypes, setShopTypes] = useState<ShopTypeRecord[]>([]);
  const [shopTypesLoading, setShopTypesLoading] = useState(false);
  const [shopTypesError, setShopTypesError] = useState<string | null>(null);
  const [managers, setManagers] = useState<BusinessManagerRecord[]>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managerSubmitting, setManagerSubmitting] = useState(false);
  const [editingManagerId, setEditingManagerId] = useState<number | null>(null);
  const [managerForm, setManagerForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const loadVendorBookings = useCallback(async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await getVendorBookings(token);
      setVendorBookings(data);
      const pendingCount = data.filter(
        (booking) => booking.status === "pending",
      ).length;
      setNotifications((prev) => {
        const withoutPendingSummary = prev.filter((item) => item.id !== 900001);
        if (pendingCount <= 0) return withoutPendingSummary;
        return [
          {
            id: 900001,
            title: "New booking requests",
            detail:
              pendingCount === 1
                ? "1 pending booking needs your response"
                : `${pendingCount} pending bookings need your response`,
            tone: "amber",
            time: "Live",
            unread: true,
          },
          ...withoutPendingSummary,
        ];
      });
    } catch (err) {
      setBookingsError(
        err instanceof Error ? err.message : "Failed to load bookings.",
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === "bookings") void loadVendorBookings();
  }, [tab, loadVendorBookings]);

  useEffect(() => {
    if (!token) return;
    void loadVendorBookings();
    const interval = window.setInterval(() => {
      void loadVendorBookings();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadVendorBookings, token]);

  const handleBookingStatusChange = async (id: number, status: string) => {
    if (!token) return;
    try {
      const updated = await updateBookingStatus(token, id, status);
      setVendorBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const resetManagerForm = () => {
    setEditingManagerId(null);
    setManagerForm({ name: "", email: "", phone: "", password: "" });
  };

  const loadManagers = useCallback(async () => {
    if (!token || !hasRemoteBusinessProfile) return;
    setManagersLoading(true);
    try {
      const rows = await getMyManagers(token);
      setManagers(rows);
    } catch (error) {
      setManagerActionMessageType("error");
      setManagerActionMessage(
        error instanceof Error ? error.message : "Failed to load managers.",
      );
    } finally {
      setManagersLoading(false);
    }
  }, [hasRemoteBusinessProfile, token]);

  useEffect(() => {
    if (tab !== "settings") return;
    void loadManagers();
  }, [loadManagers, tab]);

  const handleSaveManager = async () => {
    if (!token) {
      setManagerActionMessageType("error");
      setManagerActionMessage("You must be signed in to manage managers.");
      return;
    }

    if (!hasRemoteBusinessProfile) {
      setManagerActionMessageType("error");
      setManagerActionMessage("Complete onboarding before managing managers.");
      return;
    }

    if (
      managerForm.name.trim().length === 0 ||
      managerForm.email.trim().length === 0 ||
      managerForm.phone.trim().length === 0
    ) {
      setManagerActionMessageType("error");
      setManagerActionMessage("Name, email, and phone are required.");
      return;
    }

    if (
      editingManagerId &&
      managerForm.password &&
      managerForm.password.trim().length < 8
    ) {
      setManagerActionMessageType("error");
      setManagerActionMessage("Password must be at least 8 characters long.");
      return;
    }

    setManagerSubmitting(true);
    setManagerActionMessage(null);

    try {
      if (editingManagerId) {
        const updatePayload: {
          name: string;
          email: string;
          phone: string;
          password?: string;
        } = {
          name: managerForm.name.trim(),
          email: managerForm.email.trim(),
          phone: managerForm.phone.trim(),
        };
        if (managerForm.password.trim()) {
          updatePayload.password = managerForm.password.trim();
        }
        const updated = await updateManager(
          token,
          editingManagerId,
          updatePayload,
        );
        setManagers((current) =>
          current.map((row) =>
            row.manager_id === updated.manager_id ? updated : row,
          ),
        );
        setManagerActionMessageType("success");
        setManagerActionMessage("Manager updated successfully.");
      } else {
        const created = await createManager(token, {
          name: managerForm.name.trim(),
          email: managerForm.email.trim(),
          phone: managerForm.phone.trim(),
        });
        setManagers((current) => [created, ...current]);
        setManagerActionMessageType("success");
        setManagerActionMessage("Manager added successfully.");
      }

      resetManagerForm();
    } catch (error) {
      setManagerActionMessageType("error");
      setManagerActionMessage(
        error instanceof Error ? error.message : "Unable to save manager.",
      );
    } finally {
      setManagerSubmitting(false);
    }
  };

  const handleEditManager = (manager: BusinessManagerRecord) => {
    setEditingManagerId(manager.manager_id);
    setManagerForm({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      password: "",
    });
  };

  const handleDeleteManager = async (managerId: number) => {
    if (!token) {
      setManagerActionMessageType("error");
      setManagerActionMessage("You must be signed in to manage managers.");
      return;
    }

    const approved = window.confirm("Delete this manager account permanently?");
    if (!approved) return;

    setManagerSubmitting(true);
    setManagerActionMessage(null);
    try {
      await deleteManager(token, managerId);
      setManagers((current) =>
        current.filter((row) => row.manager_id !== managerId),
      );
      if (editingManagerId === managerId) {
        resetManagerForm();
      }
      setManagerActionMessageType("success");
      setManagerActionMessage("Manager deleted successfully.");
    } catch (error) {
      setManagerActionMessageType("error");
      setManagerActionMessage(
        error instanceof Error ? error.message : "Unable to delete manager.",
      );
    } finally {
      setManagerSubmitting(false);
    }
  };

  const getFileNameFromUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Uploaded file";
    const segment = trimmed.split("/").pop() ?? trimmed;
    return segment.split("?")[0] || "Uploaded file";
  };

  const normalizeOpeningDays = (
    value: BusinessProfileRecord["opening_days"],
  ) => {
    if (Array.isArray(value)) {
      return value.filter(
        (day): day is string =>
          typeof day === "string" && day.trim().length > 0,
      );
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (day): day is string =>
              typeof day === "string" && day.trim().length > 0,
          );
        }
      } catch {
        // Ignore non-JSON payloads and fall through to comma parsing.
      }

      return trimmed
        .split(",")
        .map((day) => day.trim())
        .filter(Boolean);
    }

    return [];
  };

  const resolveMediaUrl = (value: string | null | undefined) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    if (trimmed.startsWith("//")) {
      return `${window.location.protocol}${trimmed}`;
    }

    const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${API_ORIGIN}${normalizedPath}`;
  };

  const buildBusinessSeed = (businessType: BusinessType) => {
    const seed = createBlankSeed(businessType);
    return {
      profile: seed.profile,
      business: {
        ...seed.business,
        businessType,
      },
      catalogItems: seed.catalogItems,
      bookings: seed.bookings,
      orders: seed.orders,
      notifications: seed.notifications,
    };
  };

  const applyBusinessProfile = useCallback((record: BusinessProfileRecord) => {
    const businessType =
      record.business_type === "Shop" ? "Shop" : "Restaurant";
    const nextBusinessId = Number(record.business_id);
    const seed = buildBusinessSeed(businessType);

    setBusinessId(Number.isFinite(nextBusinessId) ? nextBusinessId : null);

    setProfile(seed.profile);
    setBusiness({
      ...seed.business,
      businessName: record.business_name || seed.business.businessName,
      businessType,
      location: record.location || seed.business.location,
      openingHours: record.opening_hours || seed.business.openingHours,
      closingHours: record.closing_hours || seed.business.closingHours,
      weekendOpeningHours:
        record.weekend_opening_hours || seed.business.weekendOpeningHours,
      weekendClosingHours:
        record.weekend_closing_hours || seed.business.weekendClosingHours,
      openingDays: normalizeOpeningDays(record.opening_days),
      businessPhone: record.business_phone || "",
      businessEmail: record.business_email || "",
      managerName: record.manager_name || "",
      managerEmail: record.manager_email || "",
      description: record.business_description || seed.business.description,
      businessProfileImage: record.business_profile_image
        ? {
            name: getFileNameFromUrl(record.business_profile_image),
            type: "image/*",
            size: 0,
            previewUrl: resolveMediaUrl(record.business_profile_image),
          }
        : undefined,
      rdbCertificate: record.rdb_certificate
        ? {
            name: getFileNameFromUrl(record.rdb_certificate),
            type: "application/octet-stream",
            size: 0,
            previewUrl: resolveMediaUrl(record.rdb_certificate),
          }
        : undefined,
    });
    setBusinessFiles({ businessProfileImage: null, rdbCertificate: null });
    setSupportingDocuments([]);
    setSavedSupportingDocuments(
      Array.isArray(record.supporting_documents)
        ? record.supporting_documents
        : [],
    );
    setCatalogItems(seed.catalogItems);
    setBookings(seed.bookings);
    setOrders(seed.orders);
    setNotifications(seed.notifications);
    setAvailabilityByItemId(
      Object.fromEntries(
        seed.catalogItems.map((item) => [
          item.id,
          !item.status.toLowerCase().includes("low"),
        ]),
      ),
    );
  }, []);

  const isShop = business.businessType === "Shop";
  const mapMenuRecordToCatalogItem = useCallback(
    (record: MenuItemRecord): CatalogItem => {
      const description = (record.description ?? "").trim();
      return {
        id: record.id,
        name: record.name,
        subtitle:
          description.slice(0, 44) || (isShop ? "Catalog item" : "Menu item"),
        price: Number(record.price),
        status: Number(record.available) === 1 ? "Active" : "Unavailable",
        metric: "Live item",
        accent: "bg-[#1a1a2e]",
        imageUrl: resolveMediaUrl(record.imageurl),
      };
    },
    [isShop],
  );

  useEffect(() => {
    if (!token || !businessId) {
      setCatalogItems([]);
      setAvailabilityByItemId({});
      return;
    }

    let active = true;

    const loadMenuItems = async () => {
      try {
        const rows = await getMenuItems({ businessId });
        if (!active) return;

        const mapped = rows.map(mapMenuRecordToCatalogItem);
        setCatalogItems(mapped);
        setAvailabilityByItemId(
          Object.fromEntries(
            mapped.map((item) => [
              item.id,
              item.status.toLowerCase() === "active",
            ]),
          ),
        );
      } catch (error) {
        if (!active) return;
        setMenuFormMessageType("error");
        setMenuFormMessage(
          error instanceof Error ? error.message : "Failed to load menu items.",
        );
      }
    };

    void loadMenuItems();

    return () => {
      active = false;
    };
  }, [businessId, mapMenuRecordToCatalogItem, token]);

  const catalogLabel = isShop ? "Products" : "Menu items";
  const primaryActionLabel = isShop ? "Add Product" : "Add Menu Item";
  const liveLabel = isShop ? "Inventory live" : "Service live";
  const navItems: { value: Tab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "catalog", label: catalogLabel },
    { value: "orders", label: isShop ? "Fulfillment" : "Orders" },
    { value: "bookings", label: "Bookings" },
    { value: "reservation", label: "Reservation" },
    { value: "analytics", label: "Analytics" },
    ...(user?.role !== "manager"
      ? [{ value: "settings" as const, label: "Settings" }]
      : []),
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
          accent: "bg-[#1a1a2e]",
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
        accent: "bg-[#1a1a2e]",
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

  const selectedRestaurantTypes = useMemo(
    () =>
      business.description
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [business.description],
  );

  const notificationCount = notifications.filter((item) => item.unread).length;

  const toggleRestaurantType = (typeName: string) => {
    setBusiness((current) => {
      const selected = current.description
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const exists = selected.some(
        (entry) => entry.toLowerCase() === typeName.toLowerCase(),
      );

      const next = exists
        ? selected.filter(
            (entry) => entry.toLowerCase() !== typeName.toLowerCase(),
          )
        : [...selected, typeName];

      return {
        ...current,
        description: next.join(", "),
      };
    });
  };

  const selectedShopTypes = useMemo(
    () =>
      business.description
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [business.description],
  );

  const toggleShopType = (typeName: string) => {
    setBusiness((current) => {
      const selected = current.description
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const exists = selected.some(
        (entry) => entry.toLowerCase() === typeName.toLowerCase(),
      );

      const next = exists
        ? selected.filter(
            (entry) => entry.toLowerCase() !== typeName.toLowerCase(),
          )
        : [...selected, typeName];

      return {
        ...current,
        description: next.join(", "),
      };
    });
  };

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
      business.closingHours.trim().length > 0 &&
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

  const resetMenuForm = () => {
    setMenuForm({
      itemName: "",
      price: "",
      prepTime: "",
      description: "",
      imageName: "",
      imagePreviewUrl: undefined,
      imageFile: null,
    });
  };

  const handleOpenMenuForm = () => {
    setMenuFormMessage(null);
    setMenuFormMessageType("success");
    setMenuFormOpen(true);
  };

  const handleMenuImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMenuForm((current) => ({
        ...current,
        imageName: file.name,
        imagePreviewUrl: String(reader.result),
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMenuFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!token) {
      setMenuFormMessageType("error");
      setMenuFormMessage("You must be signed in to create a menu item.");
      return;
    }

    const parsedPrice = Number(menuForm.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setMenuFormMessageType("error");
      setMenuFormMessage("Please enter a valid item price.");
      return;
    }

    setMenuFormSubmitting(true);
    try {
      const created = await createMenuItem(token, {
        name: menuForm.itemName.trim(),
        description: menuForm.description.trim(),
        price: parsedPrice,
        available: true,
        imageFile: menuForm.imageFile ?? null,
      });

      const prepTimeLabel = menuForm.prepTime.trim();
      const subtitle = prepTimeLabel
        ? `Prep ${prepTimeLabel} min`
        : menuForm.description.trim().slice(0, 44) || "New menu item";

      setCatalogItems((current) => [
        {
          id: created.id,
          name: created.name,
          subtitle,
          price: Number(created.price),
          status: Number(created.available) === 1 ? "Active" : "Unavailable",
          metric: "New item",
          accent: "bg-[#1a1a2e]",
          imageUrl: resolveMediaUrl(created.imageurl),
        },
        ...current,
      ]);
      setAvailabilityByItemId((current) => ({
        ...current,
        [created.id]: Boolean(created.available),
      }));

      setMenuFormMessageType("success");
      setMenuFormMessage(
        `${isShop ? "Product" : "Menu item"} created successfully.`,
      );
      setMenuFormOpen(false);
      resetMenuForm();
      window.alert(`${isShop ? "Product" : "Menu item"} saved successfully.`);
    } catch (error) {
      setMenuFormMessageType("error");
      setMenuFormMessage(
        error instanceof Error ? error.message : "Failed to save item.",
      );
    } finally {
      setMenuFormSubmitting(false);
    }
  };

  useEffect(() => {
    setAvailabilityByItemId((current) => {
      const next = { ...current };
      catalogItems.forEach((item) => {
        if (typeof next[item.id] === "boolean") return;
        next[item.id] = !item.status.toLowerCase().includes("low");
      });
      return next;
    });
  }, [catalogItems]);

  const updateUploadField = (
    field: "businessProfileImage" | "rdbCertificate",
    file: File,
  ) => {
    if (field === "businessProfileImage") {
      setBusinessFiles((current) => ({
        ...current,
        businessProfileImage: file,
      }));
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

    setBusinessFiles((current) => ({
      ...current,
      rdbCertificate: file,
    }));

    setBusiness((current) => ({
      ...current,
      rdbCertificate: mapFileToUpload(file),
    }));
  };

  const addSupportingDocuments = (files: FileList | null) => {
    if (!files?.length) return;

    const nextDocs = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      documentType: "OTHER",
      description: "",
    }));

    setSupportingDocuments((current) => [...current, ...nextDocs]);
  };

  const updateSupportingDocument = (
    id: string,
    updates: Partial<
      Pick<SupportingDocumentDraft, "documentType" | "description">
    >,
  ) => {
    setSupportingDocuments((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
    );
  };

  const removeSupportingDocument = (id: string) => {
    setSupportingDocuments((current) => current.filter((doc) => doc.id !== id));
  };

  const removeSavedSupportingDocument = async (documentId: number) => {
    if (!token) {
      setOnboardingError(
        "You must be signed in to manage supporting documents.",
      );
      return;
    }

    setOnboardingError(null);
    setDeletingSavedDocumentId(documentId);
    try {
      await deleteBusinessSupportingDocument(token, documentId);
      setSavedSupportingDocuments((current) =>
        current.filter((doc) => doc.id !== documentId),
      );
      setSupportingDocsMessage({
        type: "success",
        text: "Supporting document deleted.",
      });
    } catch (error) {
      setOnboardingError(
        error instanceof Error
          ? error.message
          : "Unable to delete supporting document.",
      );
      setSupportingDocsMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete supporting document.",
      });
    } finally {
      setDeletingSavedDocumentId(null);
    }
  };

  const uploadSupportingDocumentsFromSettings = async () => {
    if (!token) {
      setSupportingDocsMessage({
        type: "error",
        text: "You must be signed in to upload documents.",
      });
      return;
    }

    if (supportingDocuments.length === 0) {
      setSupportingDocsMessage({
        type: "error",
        text: "Select at least one document to upload.",
      });
      return;
    }

    setSupportingDocsSubmitting(true);
    setSupportingDocsMessage(null);

    try {
      const payload = {
        businessName: business.businessName.trim(),
        businessType: business.businessType,
        businessDescription: business.description.trim(),
        location: business.location.trim(),
        businessPhone: business.businessPhone.trim(),
        businessEmail: business.businessEmail.trim(),
        openingHours: business.openingHours.trim(),
        closingHours: business.closingHours.trim(),
        weekendOpeningHours: business.weekendOpeningHours.trim(),
        weekendClosingHours: business.weekendClosingHours.trim(),
        openingDays: business.openingDays,
        managerName: business.managerName.trim(),
        managerEmail: business.managerEmail.trim(),
        businessProfileImageFile: null,
        rdbCertificateFile: null,
        additionalDocuments: supportingDocuments.map(
          (doc): SupportingDocumentInput => ({
            file: doc.file,
            documentType: doc.documentType,
            description: doc.description,
          }),
        ),
      };

      const result = await updateMyBusinessProfile(token, payload);
      applyBusinessProfile(result);
      setSupportingDocsMessage({
        type: "success",
        text: "Supporting documents uploaded successfully.",
      });
    } catch (error) {
      setSupportingDocsMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to upload supporting documents.",
      });
    } finally {
      setSupportingDocsSubmitting(false);
    }
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
        business.closingHours.trim().length > 0 &&
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

  const submitOnboarding = async () => {
    if (!onboardingReady) {
      setOnboardingError("Please complete all steps before submitting.");
      return;
    }

    if (!token) {
      setOnboardingError("You must be signed in to save your vendor profile.");
      return;
    }

    setOnboardingError(null);
    setOnboardingSubmitting(true);

    try {
      const payload = {
        businessName: business.businessName.trim(),
        businessType: business.businessType,
        businessDescription: business.description.trim(),
        location: business.location.trim(),
        businessPhone: business.businessPhone.trim(),
        businessEmail: business.businessEmail.trim(),
        openingHours: business.openingHours.trim(),
        closingHours: business.closingHours.trim(),
        weekendOpeningHours: business.weekendOpeningHours.trim(),
        weekendClosingHours: business.weekendClosingHours.trim(),
        openingDays: business.openingDays,
        managerName: business.managerName.trim(),
        managerEmail: business.managerEmail.trim(),
        businessProfileImageFile: businessFiles.businessProfileImage,
        rdbCertificateFile: businessFiles.rdbCertificate,
        additionalDocuments: supportingDocuments.map(
          (doc): SupportingDocumentInput => ({
            file: doc.file,
            documentType: doc.documentType,
            description: doc.description,
          }),
        ),
      };

      const result = hasRemoteBusinessProfile
        ? await updateMyBusinessProfile(token, payload)
        : await createBusinessProfile(token, payload);

      applyBusinessProfile(result);
      setOnboardingComplete(true);
      setHasRemoteBusinessProfile(true);
    } catch (error) {
      setOnboardingError(
        error instanceof Error
          ? error.message
          : "Unable to save your vendor profile.",
      );
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const applyBusinessType = (nextType: BusinessType) => {
    const seed = buildBusinessSeed(nextType);
    setBusiness((current) => ({
      ...current,
      businessType: nextType,
      businessName: seed.business.businessName,
      location: seed.business.location,
      openingHours: seed.business.openingHours,
      closingHours: seed.business.closingHours,
      weekendOpeningHours: seed.business.weekendOpeningHours,
      weekendClosingHours: seed.business.weekendClosingHours,
      openingDays: seed.business.openingDays,
      businessPhone: seed.business.businessPhone,
      businessEmail: seed.business.businessEmail,
      managerName: seed.business.managerName,
      managerEmail: seed.business.managerEmail,
      businessProfileImage: undefined,
      rdbCertificate: undefined,
      description: seed.business.description,
    }));
    setBusinessFiles({ businessProfileImage: null, rdbCertificate: null });
    setSupportingDocuments([]);
    setSavedSupportingDocuments([]);
    setBusinessId(null);
    setProfile(seed.profile);
    setCatalogItems(seed.catalogItems);
    setBookings(seed.bookings);
    setOrders(seed.orders);
    setNotifications(seed.notifications);
    setTab("overview");
  };

  useEffect(() => {
    if (!user || !token) {
      setProfileHydrating(false);
      return;
    }

    let active = true;

    const loadBusinessProfile = async () => {
      setProfileHydrating(true);
      try {
        const remoteProfile = await getMyBusinessProfile(token);
        if (!active) return;

        if (remoteProfile) {
          setHasRemoteBusinessProfile(true);
          applyBusinessProfile(remoteProfile);
          setOnboardingComplete(true);
          setOnboardingStep(4);
        } else {
          setHasRemoteBusinessProfile(false);
          setBusinessId(null);
          if (user.role !== "manager") {
            setOnboardingComplete(Boolean(storedState?.onboardingComplete));
          }
        }
      } catch (error) {
        if (!active) return;
        setHasRemoteBusinessProfile(false);
        setBusinessId(null);
        if (user.role !== "manager") {
          setOnboardingError(
            error instanceof Error
              ? error.message
              : "Unable to load your vendor profile.",
          );
        }
      } finally {
        if (active) setProfileHydrating(false);
      }
    };

    void loadBusinessProfile();

    return () => {
      active = false;
    };
  }, [applyBusinessProfile, storedState?.onboardingComplete, token, user]);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const loadRestaurantTypes = async () => {
      setRestaurantTypesLoading(true);
      setRestaurantTypesError(null);
      try {
        const rows = await getRestaurantTypes(token);
        if (!active) return;
        setRestaurantTypes(rows);
      } catch (error) {
        if (!active) return;
        setRestaurantTypesError(
          error instanceof Error
            ? error.message
            : "Failed to load restaurant types.",
        );
      } finally {
        if (active) setRestaurantTypesLoading(false);
      }
    };

    void loadRestaurantTypes();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const loadShopTypes = async () => {
      setShopTypesLoading(true);
      setShopTypesError(null);
      try {
        const rows = await getShopTypes(token);
        if (!active) return;
        setShopTypes(rows);
      } catch (error) {
        if (!active) return;
        setShopTypesError(
          error instanceof Error ? error.message : "Failed to load shop types.",
        );
      } finally {
        if (active) setShopTypesLoading(false);
      }
    };

    void loadShopTypes();

    return () => {
      active = false;
    };
  }, [token]);

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

  if (!user || (user.role !== "vendor" && user.role !== "manager")) {
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
            className="mt-6 inline-flex rounded-full bg-[#1a1a2e] px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#1a1a2e]"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (profileHydrating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-900/85">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Loading vendor profile
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
            Checking onboarding status
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            We are loading your saved business profile from the backend.
          </p>
        </div>
      </div>
    );
  }

  if (!onboardingComplete && user?.role !== "manager") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[#1a1a2e] dark:text-[#1a1a2e]">
                Vendor onboarding
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                Complete your vendor profile first
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Fill the required steps below before the dashboard becomes
                available.
              </p>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                <p className="font-semibold">Account notice</p>
                <p className="mt-1 leading-6">
                  The manager account will automatically Created. Your initial
                  password will be based on the business name using the format
                  <span className="font-semibold">
                    {" "}
                    business_name@2026#
                  </span>{" "}
                  and he will login using that email.
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden">
              <div
                key={onboardingStep}
                className={`rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 ${onboardingDirection === "next" ? "animate-[vendor-step-next_260ms_ease]" : "animate-[vendor-step-prev_260ms_ease]"}`}
              >
                {onboardingStep === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>Business Name</span>
                      <input
                        value={business.businessName}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Business Type</span>
                      <select
                        value={business.businessType}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessType: event.target.value as BusinessType,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      >
                        <option value="Restaurant">Restaurant</option>
                        <option value="Shop">Shop</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Location</span>
                      <input
                        value={business.location}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            location: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>Business Description</span>

                      {business.businessType === "Restaurant" ? (
                        <>
                          {restaurantTypesLoading ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                              Loading restaurant types...
                            </div>
                          ) : restaurantTypes.length === 0 ? (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-300/40 dark:bg-amber-500/10 dark:text-amber-200">
                              No restaurant types available yet. Ask admin to
                              add restaurant types.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {restaurantTypes.map((item) => {
                                const checked = selectedRestaurantTypes.some(
                                  (entry) =>
                                    entry.toLowerCase() ===
                                    item.restaurant_type.toLowerCase(),
                                );
                                return (
                                  <label
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleRestaurantType(
                                          item.restaurant_type,
                                        )
                                      }
                                    />
                                    <span>{item.restaurant_type}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          {restaurantTypesError && (
                            <p className="text-xs text-rose-600 dark:text-rose-300">
                              {restaurantTypesError}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {shopTypesLoading ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                              Loading shop types...
                            </div>
                          ) : shopTypes.length === 0 ? (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-300/40 dark:bg-amber-500/10 dark:text-amber-200">
                              No shop types available yet. Ask admin to add shop
                              types.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {shopTypes.map((item) => {
                                const checked = selectedShopTypes.some(
                                  (entry) =>
                                    entry.toLowerCase() ===
                                    item.shop_type.toLowerCase(),
                                );
                                return (
                                  <label
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleShopType(item.shop_type)
                                      }
                                    />
                                    <span>{item.shop_type}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          {shopTypesError && (
                            <p className="text-xs text-rose-600 dark:text-rose-300">
                              {shopTypesError}
                            </p>
                          )}
                        </>
                      )}
                    </label>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Business Phone Number</span>
                      <PhoneNumberInput
                        value={business.businessPhone}
                        onChange={(value) =>
                          setBusiness((current) => ({
                            ...current,
                            businessPhone: value,
                          }))
                        }
                        defaultCountryIso2="RW"
                        placeholder="7XXXXXXXX"
                        className="grid grid-cols-1 gap-2"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Business Email</span>
                      <input
                        type="email"
                        value={business.businessEmail}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            businessEmail: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Manager Name</span>
                      <input
                        value={business.managerName}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            managerName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Manager Email</span>
                      <input
                        type="email"
                        value={business.managerEmail}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            managerEmail: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Weekday Opening Hour</span>
                      <input
                        type="time"
                        value={business.openingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            openingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Weekday Closing Hour</span>
                      <input
                        type="time"
                        value={business.closingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            closingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Weekend Opening Hour (optional)</span>
                      <input
                        type="time"
                        value={business.weekendOpeningHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            weekendOpeningHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <span>Weekend Closing Hour (optional)</span>
                      <input
                        type="time"
                        value={business.weekendClosingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            weekendClosingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>Opening Days</span>
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
                      <span>Business Profile Image</span>
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
                      <span>RDB Certificate</span>
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
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                      <span>Other Supporting Documents (Optional)</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*,.doc,.docx"
                        multiple
                        onChange={(event) => {
                          addSupportingDocuments(event.target.files);
                          event.currentTarget.value = "";
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                      />

                      {supportingDocuments.length > 0 && (
                        <div className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                          {supportingDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className="grid gap-2 rounded-lg border border-slate-200 p-3 dark:border-white/10 sm:grid-cols-[2fr_1fr_auto]"
                            >
                              <div className="space-y-1">
                                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {doc.file.name}
                                </p>
                                <input
                                  value={doc.description}
                                  onChange={(event) =>
                                    updateSupportingDocument(doc.id, {
                                      description: event.target.value,
                                    })
                                  }
                                  placeholder="Description (optional)"
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                                />
                              </div>

                              <select
                                value={doc.documentType}
                                onChange={(event) =>
                                  updateSupportingDocument(doc.id, {
                                    documentType: event.target.value,
                                  })
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                              >
                                <option value="OTHER">OTHER</option>
                                <option value="NID">NID</option>
                                <option value="LICENSE">LICENSE</option>
                                <option value="TAX_CERTIFICATE">
                                  TAX_CERTIFICATE
                                </option>
                              </select>

                              <button
                                type="button"
                                onClick={() => removeSupportingDocument(doc.id)}
                                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {savedSupportingDocuments.length > 0 && (
                        <div className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                            Previously uploaded documents
                          </p>
                          <ul className="space-y-2">
                            {savedSupportingDocuments.map((doc) => {
                              const href =
                                resolveMediaUrl(doc.file_url) || doc.file_url;
                              return (
                                <li
                                  key={doc.id}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-white/10"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                      {doc.document_type || "OTHER"}
                                    </p>
                                    {doc.description && (
                                      <p className="text-slate-500 dark:text-slate-400">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-semibold text-[#1a1a2e] underline dark:text-sky-300"
                                    >
                                      View file
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSavedSupportingDocument(doc.id)
                                      }
                                      disabled={
                                        deletingSavedDocumentId === doc.id
                                      }
                                      className="rounded-md border border-rose-200 px-2 py-1 font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                    >
                                      {deletingSavedDocumentId === doc.id
                                        ? "Removing..."
                                        : "Remove"}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
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
                  className="rounded-full bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a2e]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitOnboarding}
                  disabled={onboardingSubmitting}
                  className="rounded-full bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a2e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {onboardingSubmitting
                    ? "Saving profile..."
                    : "Submit & Go to Dashboard"}
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
                      className={`absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? "bg-[#1a1a2e] text-white" : isCurrent ? "bg-[#1a1a2e]/20 text-[#1a1a2e] dark:text-[#1a1a2e]" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}
                    >
                      {isCompleted ? "\u2714" : step.id}
                    </span>
                    <p
                      className={`text-sm ${isCurrent ? "font-bold text-[#1a1a2e] dark:text-[#1a1a2e]" : isUpcoming ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}
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
                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e] text-xs font-bold text-white md:flex">
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
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-[#1a1a2e] hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 md:inline-flex"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "\u00BB" : "\u00AB"}
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTab(item.value);
                  if (item.value === "catalog") {
                    setMenuFormOpen(false);
                    setMenuFormMessage(null);
                  }
                  setSidebarOpen(false);
                }}
                title={item.label}
                className={`group flex w-full items-center rounded-2xl py-3 text-left text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-950/5 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"} ${tab === item.value ? "bg-[#1a1a2e] text-white shadow-lg shadow-[#1a1a2e]/20" : "text-slate-600 dark:text-slate-300"}`}
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
                      {"\u2192"}
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:hidden"
                  aria-label="Open sidebar"
                >
                  {"\u2630"}
                </button>
                <label className="flex min-w-[180px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-200/60 px-4 py-2.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 sm:max-w-md">
                  <span>{"\u2315"}</span>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search menu items..."
                    className="w-full border-none bg-transparent outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {user?.role !== "manager" && (
                  <button
                    type="button"
                    onClick={() => setTab("settings")}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
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
                        <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a1a2e] px-1 text-[10px] font-bold text-white">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleDark}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                  title={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? "\u2600" : "\u263E"}
                </button>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-left text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1a1a2e] bg-slate-900 text-xs font-bold text-white">
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
                        <span>{darkMode ? "\u2600" : "\u263E"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <span>Logout</span>
                        <span>{"\u21AA"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-6 space-y-6">
            {tab !== "catalog" && (
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
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === item.value ? "bg-[#1a1a2e] text-white shadow-lg shadow-[#1a1a2e]/25" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
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
                    <span className="rounded-full bg-[#1a1a2e]/15 px-3 py-1 text-xs font-semibold text-[#1a1a2e] dark:text-[#1a1a2e]">
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
                        className="flex w-full items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1a1a2e] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        <span
                          className={`mt-0.5 h-2.5 w-2.5 rounded-full ${notification.unread ? "bg-[#1a1a2e]" : "bg-slate-300"}`}
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
            )}

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
                              className="h-full rounded-full bg-gradient-to-r from-[#1a1a2e] to-sky-500"
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
                          className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1a1a2e] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          <div
                            className={`h-14 w-14 rounded-2xl ${item.accent} shadow-lg shadow-[#1a1a2e]/15`}
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
                          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1a1a2e] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          <span>
                            <span className="block font-semibold text-slate-950 dark:text-white">
                              {action.title}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                              {action.detail}
                            </span>
                          </span>
                          <span className="text-lg text-[#1a1a2e]">+</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </section>
            )}

            {tab === "catalog" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Dashboard &gt; Menus &gt; Add New Item
                    </p>
                    <h2 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {isShop ? "Catalog Management" : "Menu Management"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Manage your {catalogLabel.toLowerCase()} and availability
                      in real-time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenMenuForm}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1a1a2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a2e]"
                  >
                    <span className="text-lg leading-none">+</span>
                    {isShop ? "Add New Product" : "Add New Item"}
                  </button>
                </div>

                {menuFormOpen && (
                  <SectionCard
                    title={isShop ? "Product Details" : "Item Details"}
                    subtitle={`Fill in the information below to add a new ${isShop ? "product" : "menu item"}.`}
                  >
                    <form
                      onSubmit={handleMenuFormSubmit}
                      className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Item name
                          </span>
                          <input
                            required
                            value={menuForm.itemName}
                            onChange={(event) =>
                              setMenuForm((current) => ({
                                ...current,
                                itemName: event.target.value,
                              }))
                            }
                            placeholder={
                              isShop
                                ? "e.g. Handwoven Basket"
                                : "e.g. Traditional Akabenz"
                            }
                            className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Price (RWF)
                          </span>
                          <input
                            required
                            type="number"
                            min={0}
                            value={menuForm.price}
                            onChange={(event) =>
                              setMenuForm((current) => ({
                                ...current,
                                price: event.target.value,
                              }))
                            }
                            placeholder="5500"
                            className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Prep time (min)
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={menuForm.prepTime}
                            onChange={(event) =>
                              setMenuForm((current) => ({
                                ...current,
                                prepTime: event.target.value,
                              }))
                            }
                            placeholder="25"
                            className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Description
                          </span>
                          <textarea
                            required
                            rows={4}
                            value={menuForm.description}
                            onChange={(event) =>
                              setMenuForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Tell your customers about this item, its ingredients, and what makes it special."
                            className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                          />
                        </label>
                      </div>

                      <div className="space-y-4">
                        <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/20 dark:bg-white/5">
                          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a2e]/15 text-2xl text-[#1a1a2e] dark:text-[#1a1a2e]">
                            IMG
                          </span>
                          <span className="text-base font-semibold text-slate-700 dark:text-slate-200">
                            Images in public directory
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Click to choose an image from the public directory.
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              handleMenuImageChange(file);
                            }}
                          />
                        </label>

                        {menuForm.imagePreviewUrl && (
                          <img
                            src={menuForm.imagePreviewUrl}
                            alt="Item preview"
                            className="h-36 w-full rounded-[1.5rem] object-cover"
                          />
                        )}

                        <div className="rounded-[1.5rem] border border-[#1a1a2e]/20 bg-[#1a1a2e]/10 px-4 py-3 text-sm text-[#1a1a2e] dark:text-[#1a1a2e]">
                          Items with high-quality photos receive more orders.
                          {menuForm.imageName && (
                            <span className="mt-1 block text-xs">
                              Selected: {menuForm.imageName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-2 flex justify-end gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            resetMenuForm();
                            setMenuFormOpen(false);
                          }}
                          className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={menuFormSubmitting}
                          className="rounded-full bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a2e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {menuFormSubmitting ? "Saving..." : "Create Item"}
                        </button>
                      </div>
                    </form>
                  </SectionCard>
                )}

                {menuFormMessage && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${menuFormMessageType === "success" ? "border border-[#1a1a2e]/30 bg-[#1a1a2e]/10 text-[#1a1a2e] dark:text-[#1a1a2e]" : "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}
                  >
                    {menuFormMessage}
                  </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.65fr]">
                  <article className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
                    <div className="flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] bg-slate-50 p-5 dark:bg-white/5">
                      <div>
                        <p className="inline-flex rounded-full bg-[#1a1a2e]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1a2e] dark:text-[#1a1a2e]">
                          Primary outlet
                        </p>
                        <h3 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                          {business.businessName}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Location:{" "}
                          {business.location ||
                            "Complete onboarding to set your business location."}
                        </p>
                      </div>
                      {business.businessProfileImage?.previewUrl ? (
                        <img
                          src={business.businessProfileImage.previewUrl}
                          alt="Business profile"
                          className="h-24 w-24 rounded-3xl object-cover shadow-lg shadow-[#1a1a2e]/25"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-sky-500 text-3xl text-white shadow-lg shadow-[#1a1a2e]/25">
                          {business.businessType === "Shop" ? "SHOP" : "FOOD"}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] bg-slate-100 px-5 py-4 dark:bg-white/10">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                          Active Items
                        </p>
                        <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">
                          {filteredCatalog.length}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] bg-slate-100 px-5 py-4 dark:bg-white/10">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                          Today's Sales
                        </p>
                        <p className="mt-1 text-3xl font-semibold text-[#1a1a2e] dark:text-[#1a1a2e]">
                          {money.format(
                            orders.reduce((sum, order) => sum + order.total, 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[2rem] bg-[#1a1a2e] p-6 text-white shadow-[0_20px_50px_rgba(5,150,105,0.35)]">
                    <h3 className="text-3xl font-semibold tracking-tight">
                      Setup Status
                    </h3>
                    <p className="mt-3 text-sm text-[#1a1a2e]/90">
                      Your business data now comes from the backend. Add a menu
                      item or complete onboarding to populate this dashboard.
                    </p>
                    <div className="mt-5 space-y-3">
                      {[
                        {
                          label: "Business profile",
                          status: onboardingComplete ? "READY" : "PENDING",
                        },
                        {
                          label: "Menu inventory",
                          status: catalogItems.length > 0 ? "READY" : "EMPTY",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl bg-[#1a1a2e]/70 px-4 py-3 text-sm"
                        >
                          <span>{item.label}</span>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "READY" ? "bg-[#1a1a2e] text-[#1a1a2e]" : "bg-amber-100 text-amber-700"}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab("catalog")}
                      className="mt-6 w-full rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-[#1a1a2e] transition hover:bg-white"
                    >
                      Add Menu Item
                    </button>
                  </article>
                </div>

                <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
                    <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">
                      {isShop ? "Inventory" : "Menu Inventory"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"
                        aria-label="Filter menu"
                      >
                        {"\u2261"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-slate-100 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-3">Item Details</th>

                          <th className="px-6 py-3">Price (RWF)</th>
                          <th className="px-6 py-3">Availability</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCatalog.slice(0, 4).map((item) => {
                          return (
                            <tr
                              key={item.id}
                              className="border-t border-slate-200/70 dark:border-white/10"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      item.imageUrl ||
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23cbd5e1'/%3E%3C/svg%3E"
                                    }
                                    alt={item.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).src =
                                        `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23cbd5e1'/%3E%3C/svg%3E`;
                                    }}
                                  />
                                  <div>
                                    <p className="font-semibold text-slate-950 dark:text-white">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-2xl font-semibold text-slate-950 dark:text-white">
                                {item.price.toLocaleString("en-RW")}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={
                                    availabilityByItemId[item.id] ?? true
                                  }
                                  aria-label={`Toggle availability for ${item.name}`}
                                  onClick={() =>
                                    setAvailabilityByItemId((current) => ({
                                      ...current,
                                      [item.id]: !(current[item.id] ?? true),
                                    }))
                                  }
                                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${(availabilityByItemId[item.id] ?? true) ? "bg-[#1a1a2e]" : "bg-slate-300 dark:bg-slate-600"}`}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${(availabilityByItemId[item.id] ?? true) ? "translate-x-6" : "translate-x-1"}`}
                                  />
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-200/70 px-6 py-5 text-center dark:border-white/10">
                    <button
                      type="button"
                      className="rounded-full border border-[#1a1a2e] px-10 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] hover:text-[#1a1a2e] dark:border-[#1a1a2e]/30 dark:text-slate-200"
                    >
                      Load More Items
                    </button>
                  </div>
                </section>
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
                                  ? `${bookingEntry.table} \u2022 ${bookingEntry.slot}`
                                  : `${orderEntry.items.join(", ")} \u2022 ${orderEntry.age}`}
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
                        <p className="mt-3 text-base font-semibold text-[#1a1a2e] dark:text-[#1a1a2e]">
                          {money.format(order.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </section>
            )}

            {tab === "reservation" && <ReservationPage />}

            {tab === "bookings" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Dashboard &gt; Bookings
                    </p>
                    <h2 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      Reservations
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Manage and confirm customer bookings for your restaurant.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadVendorBookings()}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] dark:border-white/10 dark:text-slate-200"
                  >
                    &#8635; Refresh
                  </button>
                </div>

                {bookingsError && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
                    {bookingsError}
                  </div>
                )}

                {bookingsLoading ? (
                  <div className="rounded-[2rem] border border-white/70 bg-white/85 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/80">
                    Loading bookings...
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
                    <div className="border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
                      <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">
                        All Bookings
                      </h3>
                    </div>
                    {vendorBookings.length === 0 ? (
                      <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        No bookings found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                          <thead className="bg-slate-100 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                            <tr>
                              <th className="px-6 py-3">Full Name</th>
                              <th className="px-6 py-3">Email</th>
                              <th className="px-6 py-3">Telephone</th>
                              <th className="px-6 py-3">Date &amp; Time</th>
                              <th className="px-6 py-3">Table Of</th>
                              <th className="px-6 py-3">Special Request</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendorBookings.map((booking) => (
                              <tr
                                key={booking.id}
                                className="border-t border-slate-200/70 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                              >
                                <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                                  {booking.fullnames}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {booking.email}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {booking.telephone}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                  <p>{booking.date}</p>
                                  <p>{booking.time}</p>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-slate-950 dark:text-white">
                                  {booking.number_of_people}
                                </td>
                                <td className="max-w-[160px] truncate px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {booking.special_request || "—"}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[booking.status] ?? "bg-slate-500/15 text-slate-600"}`}
                                  >
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedBooking(booking)
                                      }
                                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#1a1a2e] hover:text-[#1a1a2e] dark:border-white/10 dark:text-slate-300"
                                    >
                                      View
                                    </button>
                                    {booking.status !== "confirmed" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleBookingStatusChange(
                                            booking.id,
                                            "confirmed",
                                          )
                                        }
                                        className="rounded-full bg-[#1a1a2e] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {booking.status !== "cancelled" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleBookingStatusChange(
                                            booking.id,
                                            "cancelled",
                                          )
                                        }
                                        className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {selectedBooking && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                onClick={() => setSelectedBooking(null)}
              >
                <div
                  className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Booking details
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                        {selectedBooking.fullnames}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-400"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          label: "Full Name",
                          value: selectedBooking.fullnames,
                        },
                        { label: "Email", value: selectedBooking.email },
                        {
                          label: "Telephone",
                          value: selectedBooking.telephone,
                        },
                        { label: "Date", value: selectedBooking.date },
                        { label: "Time", value: selectedBooking.time },
                        {
                          label: "Number of People",
                          value: String(selectedBooking.number_of_people),
                        },
                        {
                          label: "Menu Item",
                          value:
                            catalogItems.find(
                              (m) => m.id === selectedBooking.menu_id,
                            )?.name ?? `Menu #${selectedBooking.menu_id}`,
                        },
                        { label: "Status", value: selectedBooking.status },
                        {
                          label: "Special Request",
                          value: selectedBooking.special_request || "None",
                          full: true,
                        },
                        {
                          label: "Booked On",
                          value: new Date(
                            selectedBooking.created_at,
                          ).toLocaleString(),
                          full: true,
                        },
                      ] as { label: string; value: string; full?: boolean }[]
                    ).map(({ label, value, full }) => (
                      <div
                        key={label}
                        className={`rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5${full ? " sm:col-span-2" : ""}`}
                      >
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    {selectedBooking.status !== "confirmed" && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleBookingStatusChange(
                            selectedBooking.id,
                            "confirmed",
                          );
                          setSelectedBooking(null);
                        }}
                        className="rounded-full bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-80"
                      >
                        Confirm
                      </button>
                    )}
                    {selectedBooking.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleBookingStatusChange(
                            selectedBooking.id,
                            "cancelled",
                          );
                          setSelectedBooking(null);
                        }}
                        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(null)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-white/10 dark:text-slate-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
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
                                className="w-full rounded-t-2xl bg-gradient-to-t from-[#1a1a2e] to-[#1a1a2e] shadow-lg shadow-[#1a1a2e]/15"
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

            {tab === "settings" && user?.role !== "manager" && (
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Phone
                      </span>
                      <PhoneNumberInput
                        value={profile.phone}
                        onChange={(value) =>
                          setProfile((current) => ({
                            ...current,
                            phone: value,
                          }))
                        }
                        defaultCountryIso2="RW"
                        placeholder="7XXXXXXXX"
                        className="grid grid-cols-1 gap-2"
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Weekday opening hour
                      </span>
                      <input
                        type="time"
                        value={business.openingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            openingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Weekday closing hour
                      </span>
                      <input
                        type="time"
                        value={business.closingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            closingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Weekend opening hour
                      </span>
                      <input
                        type="time"
                        value={business.weekendOpeningHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            weekendOpeningHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                        Weekend closing hour
                      </span>
                      <input
                        type="time"
                        value={business.weekendClosingHours}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            weekendClosingHours: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => applyBusinessType("Restaurant")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                    >
                      Switch to restaurant view
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBusinessType("Shop")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
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

                <SectionCard
                  title="Manage Managers"
                  subtitle="Add, update, and delete managers in a table view"
                >
                  <div className="mb-6 space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Supporting documents
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        Upload, view, and delete files
                      </h4>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/*,.doc,.docx"
                      onChange={(event) => {
                        addSupportingDocuments(event.target.files);
                        event.currentTarget.value = "";
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                    />

                    {supportingDocuments.length > 0 && (
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        {supportingDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="grid gap-2 rounded-lg border border-slate-200 p-2 dark:border-white/10 sm:grid-cols-[2fr_1fr_auto]"
                          >
                            <div className="space-y-1">
                              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                {doc.file.name}
                              </p>
                              <input
                                value={doc.description}
                                onChange={(event) =>
                                  updateSupportingDocument(doc.id, {
                                    description: event.target.value,
                                  })
                                }
                                placeholder="Description (optional)"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none dark:border-white/10 dark:bg-white/5"
                              />
                            </div>

                            <select
                              value={doc.documentType}
                              onChange={(event) =>
                                updateSupportingDocument(doc.id, {
                                  documentType: event.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none dark:border-white/10 dark:bg-white/5"
                            >
                              <option value="OTHER">OTHER</option>
                              <option value="NID">NID</option>
                              <option value="LICENSE">LICENSE</option>
                              <option value="TAX_CERTIFICATE">
                                TAX_CERTIFICATE
                              </option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeSupportingDocument(doc.id)}
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-400/40 dark:text-rose-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            void uploadSupportingDocumentsFromSettings()
                          }
                          disabled={supportingDocsSubmitting}
                          className="rounded-lg bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {supportingDocsSubmitting
                            ? "Uploading..."
                            : "Upload supporting documents"}
                        </button>
                      </div>
                    )}

                    {savedSupportingDocuments.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No supporting documents uploaded yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {savedSupportingDocuments.map((doc) => {
                          const href =
                            resolveMediaUrl(doc.file_url) || doc.file_url;
                          return (
                            <li
                              key={doc.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                            >
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {doc.document_type || "OTHER"}
                                </p>
                                {doc.description && (
                                  <p className="text-slate-500 dark:text-slate-400">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-semibold text-[#1a1a2e] underline dark:text-sky-300"
                                >
                                  View
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeSavedSupportingDocument(doc.id)
                                  }
                                  disabled={deletingSavedDocumentId === doc.id}
                                  className="rounded-md border border-rose-200 px-2 py-1 font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/40 dark:text-rose-300"
                                >
                                  {deletingSavedDocumentId === doc.id
                                    ? "Removing..."
                                    : "Delete"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {supportingDocsMessage && (
                      <p
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${
                          supportingDocsMessage.type === "success"
                            ? "bg-[#1a1a2e]/10 text-[#1a1a2e] dark:text-[#1a1a2e]"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {supportingDocsMessage.text}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        value={managerForm.name}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Manager name"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                      <input
                        type="email"
                        value={managerForm.email}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="manager@email.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                      <PhoneNumberInput
                        value={managerForm.phone}
                        onChange={(value) =>
                          setManagerForm((current) => ({
                            ...current,
                            phone: value,
                          }))
                        }
                        defaultCountryIso2="RW"
                        placeholder="7XXXXXXXX"
                        className="grid grid-cols-1 gap-2"
                      />
                    </div>
                    {editingManagerId && (
                      <input
                        type="password"
                        value={managerForm.password}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="New password (leave blank to keep existing)"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5"
                      />
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleSaveManager()}
                        disabled={managerSubmitting}
                        className="rounded-full bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a2e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {managerSubmitting
                          ? "Saving..."
                          : editingManagerId
                            ? "Update manager"
                            : "Add manager"}
                      </button>
                      {editingManagerId && (
                        <button
                          type="button"
                          onClick={resetManagerForm}
                          disabled={managerSubmitting}
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                          Cancel edit
                        </button>
                      )}
                    </div>

                    {managerActionMessage && (
                      <p
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${managerActionMessageType === "success" ? "bg-[#1a1a2e]/10 text-[#1a1a2e] dark:text-[#1a1a2e]" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}
                      >
                        {managerActionMessage}
                      </p>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-white/10">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-100 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {managersLoading ? (
                            <tr>
                              <td
                                className="px-4 py-4 text-slate-500"
                                colSpan={5}
                              >
                                Loading managers...
                              </td>
                            </tr>
                          ) : managers.length === 0 ? (
                            <tr>
                              <td
                                className="px-4 py-4 text-slate-500"
                                colSpan={5}
                              >
                                No managers added yet.
                              </td>
                            </tr>
                          ) : (
                            managers.map((manager) => (
                              <tr
                                key={manager.manager_id}
                                className="border-t border-slate-200/70 dark:border-white/10"
                              >
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                  {manager.name}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                  {manager.email}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                  {manager.phone}
                                </td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                  {new Date(
                                    manager.created_at,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditManager(manager)}
                                      disabled={managerSubmitting}
                                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:text-slate-300 dark:hover:bg-white/5"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteManager(
                                          manager.manager_id,
                                        )
                                      }
                                      disabled={managerSubmitting}
                                      className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </SectionCard>
              </section>
            )}
            {tab === "settings" && user?.role === "manager" && (
              <section>
                <SectionCard
                  title="Manager Access Restricted"
                  subtitle="Managers do not have access to business settings"
                >
                  <div className="text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Business settings are only available to business owners.
                      As a manager, you can view all business details but cannot
                      modify settings.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("overview")}
                      className="rounded-full bg-[#1a1a2e] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a2e]/90"
                    >
                      Back to Overview
                    </button>
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
