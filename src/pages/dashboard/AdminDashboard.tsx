import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, hasRole } from "../../context/AppContext";
import {
  createRestaurantType,
  deleteRestaurantType,
  deleteBusinessSupportingDocumentByBusinessId,
  updateRestaurantType,
  createShopType,
  deleteShopType,
  getAdminUsers,
  getBusinessProfileById,
  getBusinessProfiles,
  getRestaurantTypes,
  getShopTypes,
  getVendorApplications,
  uploadBusinessSupportingDocumentsByBusinessId,
  setBusinessVerification,
  reviewVendorApplication,
  updateShopType,
  type AdminUserRecord,
  type BusinessProfileRecord,
  type RestaurantTypeRecord,
  type ShopTypeRecord,
  type SupportingDocumentInput,
  type VendorApplicationRecord,
} from "../../utils/api";

type SupportingDocumentDraft = {
  id: string;
  file: File;
  documentType: string;
  description: string;
};

type Tab = "overview" | "users" | "vendors" | "documents" | "reports";

// SVG Icon Component
const IconComponent = ({ name, size = "w-5 h-5" }: { name: string; size?: string }) => {
  const icons: Record<string, ReactElement> = {
    overview: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="4" rx="1"></rect>
        <rect x="14" y="10" width="7" height="11" rx="1"></rect>
        <rect x="3" y="13" width="7" height="8" rx="1"></rect>
      </svg>
    ),
    users: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    vendors: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9L12 5.5L18 9M6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9M9 13H15"></path>
      </svg>
    ),
    documents: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    ),
    reports: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    user: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    shopping: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    clock: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    calendar: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    checkmark: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    message: (
      <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  };
  return icons[name] || <span>{name}</span>;
};

const navItems: { tab: Tab; icon: string; label: string }[] = [
  { tab: "overview", icon: "overview", label: "Overview" },
  { tab: "users", icon: "users", label: "Users" },
  { tab: "vendors", icon: "vendors", label: "Vendors" },
  { tab: "documents", icon: "documents", label: "Documents" },
  { tab: "reports", icon: "reports", label: "Reports" },
];

export default function AdminDashboard() {
  const { user, token, logout } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [businessProfiles, setBusinessProfiles] = useState<
    BusinessProfileRecord[]
  >([]);
  const [vendorApplications, setVendorApplications] = useState<
    VendorApplicationRecord[]
  >([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null,
  );
  const [selectedBusinessDetails, setSelectedBusinessDetails] =
    useState<BusinessProfileRecord | null>(null);
  const [adminSupportingDocuments, setAdminSupportingDocuments] = useState<
    SupportingDocumentDraft[]
  >([]);
  const [isUploadingBusinessDocs, setIsUploadingBusinessDocs] = useState(false);
  const [isDeletingBusinessDocId, setIsDeletingBusinessDocId] = useState<
    number | null
  >(null);
  const [documentBusinessQuery, setDocumentBusinessQuery] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("ALL");
  const [isTogglingBusinessId, setIsTogglingBusinessId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restaurantTypes, setRestaurantTypes] = useState<
    RestaurantTypeRecord[]
  >([]);
  const [newRestaurantType, setNewRestaurantType] = useState("");
  const [isAddingRestaurantType, setIsAddingRestaurantType] = useState(false);
  const [editingRestaurantTypeId, setEditingRestaurantTypeId] = useState<
    number | null
  >(null);
  const [editingRestaurantName, setEditingRestaurantName] = useState("");
  const [isDeletingRestaurantTypeId, setIsDeletingRestaurantTypeId] = useState<
    number | null
  >(null);
  const [shopTypes, setShopTypes] = useState<ShopTypeRecord[]>([]);
  const [newShopType, setNewShopType] = useState("");
  const [isAddingShopType, setIsAddingShopType] = useState(false);
  const [editingShopTypeId, setEditingShopTypeId] = useState<number | null>(
    null,
  );
  const [editingShopName, setEditingShopName] = useState("");
  const [isDeletingShopTypeId, setIsDeletingShopTypeId] = useState<
    number | null
  >(null);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const closeSidebarIfMobile = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 639px)").matches) setSidebarOpen(false);
  };

  const selectedApplication = useMemo(
    () =>
      selectedApplicationId === null
        ? null
        : (vendorApplications.find((app) => app.id === selectedApplicationId) ??
          null),
    [selectedApplicationId, vendorApplications],
  );

  const selectedBusiness = useMemo(
    () =>
      selectedBusinessId === null
        ? null
        : (businessProfiles.find(
            (business) => business.business_id === selectedBusinessId,
          ) ?? null),
    [selectedBusinessId, businessProfiles],
  );

  const selectedBusinessForModal = selectedBusinessDetails ?? selectedBusiness;

  const getApplicationChecklist = (application: VendorApplicationRecord) => {
    const payloadInput = application.payload;
    const payloadParsed =
      typeof payloadInput === "string"
        ? (() => {
            try {
              return JSON.parse(payloadInput) as unknown;
            } catch {
              return {};
            }
          })()
        : payloadInput;
    const payload = (payloadParsed ?? {}) as {
      profile?: Record<string, unknown>;
      business?: Record<string, unknown>;
    };
    const profile = (payload.profile ?? {}) as Record<string, unknown>;
    const business = (payload.business ?? {}) as Record<string, unknown>;

    const missing: string[] = [];

    const requiredText = (label: string, value: unknown) => {
      if (typeof value !== "string" || value.trim().length === 0)
        missing.push(label);
    };

    const requiredNumber = (label: string, value: unknown) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
        missing.push(label);
    };

    const requiredArray = (label: string, value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) missing.push(label);
    };

    const requiredUpload = (label: string, value: unknown) => {
      const upload = value as { name?: unknown } | undefined;
      if (
        !upload ||
        typeof upload.name !== "string" ||
        upload.name.trim().length === 0
      )
        missing.push(label);
    };

    requiredText("Owner name", profile.ownerName);
    requiredText("Owner email", profile.email);
    requiredText("Owner phone", profile.phone);
    requiredText("Owner description", profile.description);

    requiredText("Business name", business.businessName);
    requiredText("Business type (Restaurant/Shop)", business.businessType);
    requiredText("Business location", business.location);
    requiredText("Business email", business.businessEmail);
    requiredText("Business phone", business.businessPhone);
    requiredText("Manager name", business.managerName);
    requiredText("Manager email", business.managerEmail);
    requiredText("Opening hours", business.openingHours);
    requiredText("Website URL", business.website);
    requiredArray("Categories", business.categories);
    requiredNumber("Number of tables", business.tablesCount);
    requiredNumber("Capacity (people)", business.capacity);

    requiredUpload("Business profile image", business.profileImage);
    requiredUpload("PDF menu", business.menuPdf);
    requiredUpload("RDB certificate", business.rdbCertificate);

    return { missing, isComplete: missing.length === 0 };
  };

  const pendingApplications = useMemo(
    () => vendorApplications.filter((app) => app.status === "pending").length,
    [vendorApplications],
  );

  const filteredBusinessesForDocuments = useMemo(() => {
    const query = documentBusinessQuery.trim().toLowerCase();
    if (!query) return businessProfiles;
    return businessProfiles.filter((business) => {
      const fields = [
        business.business_name,
        business.business_type,
        business.location,
        business.owner_name,
        business.owner_email,
      ]
        .map((value) => (typeof value === "string" ? value.toLowerCase() : ""))
        .join(" ");
      return fields.includes(query);
    });
  }, [businessProfiles, documentBusinessQuery]);

  const filteredSelectedBusinessDocuments = useMemo(() => {
    const docs = selectedBusinessForModal?.supporting_documents ?? [];
    if (documentTypeFilter === "ALL") return docs;
    return docs.filter(
      (doc) => (doc.document_type ?? "OTHER") === documentTypeFilter,
    );
  }, [documentTypeFilter, selectedBusinessForModal?.supporting_documents]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      if (!token) {
        if (mounted) {
          setIsLoading(false);
          setLoadError("Missing auth token. Please sign in again.");
        }
        return;
      }

      try {
        if (mounted) {
          setIsLoading(true);
          setLoadError(null);
        }

        const [
          usersData,
          businessesData,
          applicationsData,
          restaurantTypesData,
          shopTypesData,
        ] = await Promise.all([
          getAdminUsers(token),
          getBusinessProfiles(),
          getVendorApplications(token),
          getRestaurantTypes(token),
          getShopTypes(token),
        ]);

        if (!mounted) return;
        setUsers(usersData);
        setBusinessProfiles(businessesData);
        setVendorApplications(applicationsData);
        setRestaurantTypes(restaurantTypesData);
        setShopTypes(shopTypesData);
      } catch (error) {
        if (!mounted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load admin dashboard data.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;

    const loadSelectedBusiness = async () => {
      if (!token || selectedBusinessId === null) {
        if (active) {
          setSelectedBusinessDetails(null);
          setAdminSupportingDocuments([]);
        }
        return;
      }

      try {
        const details = await getBusinessProfileById(token, selectedBusinessId);
        if (!active) return;
        setSelectedBusinessDetails(details);
      } catch (error) {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load business profile details.",
        );
      }
    };

    void loadSelectedBusiness();

    return () => {
      active = false;
    };
  }, [selectedBusinessId, token]);

  const pendingApprovals = pendingApplications;
  const approvedVendors = businessProfiles.filter(
    (business) => business.is_verified === true,
  ).length;

  const refreshBusinesses = async () => {
    try {
      setLoadError(null);
      const businessesData = await getBusinessProfiles();
      setBusinessProfiles(businessesData);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to refresh registered businesses.",
      );
    }
  };

  const refreshApplications = async () => {
    if (!token) return;
    try {
      setLoadError(null);
      const applicationsData = await getVendorApplications(token);
      setVendorApplications(applicationsData);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to refresh vendor applications.",
      );
    }
  };

  const handleReviewApplication = async (
    id: number,
    status: "approved" | "rejected",
  ) => {
    if (!token) return;
    try {
      setLoadError(null);
      await reviewVendorApplication(token, id, status);
      await refreshApplications();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update application status.",
      );
    }
  };

  const handleToggleBusinessVerification = async (
    business: BusinessProfileRecord,
  ) => {
    if (!token || typeof business.business_id !== "number") return;

    const nextVerified = !(business.is_verified ?? false);

    try {
      setLoadError(null);
      setIsTogglingBusinessId(business.business_id);
      await setBusinessVerification(token, business.business_id, nextVerified);
      await refreshBusinesses();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update business verification status.",
      );
    } finally {
      setIsTogglingBusinessId(null);
    }
  };

  const handleAddRestaurantType = async () => {
    if (!token) return;

    const value = newRestaurantType.trim();
    if (!value) {
      setLoadError("Restaurant type is required.");
      return;
    }

    try {
      setLoadError(null);
      setIsAddingRestaurantType(true);
      const created = await createRestaurantType(token, value);
      setRestaurantTypes((current) => {
        const next = [created, ...current];
        next.sort((a, b) =>
          a.restaurant_type.localeCompare(b.restaurant_type, "en", {
            sensitivity: "base",
          }),
        );
        return next;
      });
      setNewRestaurantType("");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to add restaurant type.",
      );
    } finally {
      setIsAddingRestaurantType(false);
    }
  };

  const handleEditRestaurantType = async () => {
    if (!token || editingRestaurantTypeId === null) return;

    const value = editingRestaurantName.trim();
    if (!value) {
      setLoadError("Restaurant type is required.");
      return;
    }

    try {
      setLoadError(null);
      const updated = await updateRestaurantType(
        token,
        editingRestaurantTypeId,
        value,
      );
      setRestaurantTypes((current) => {
        const next = current.map((item) =>
          item.id === editingRestaurantTypeId ? updated : item,
        );
        next.sort((a, b) =>
          a.restaurant_type.localeCompare(b.restaurant_type, "en", {
            sensitivity: "base",
          }),
        );
        return next;
      });
      setEditingRestaurantTypeId(null);
      setEditingRestaurantName("");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update restaurant type.",
      );
    }
  };

  const handleDeleteRestaurantType = async (id: number) => {
    if (
      !token ||
      !window.confirm("Are you sure you want to delete this restaurant type?")
    )
      return;

    try {
      setLoadError(null);
      setIsDeletingRestaurantTypeId(id);
      await deleteRestaurantType(token, id);
      setRestaurantTypes((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to delete restaurant type.",
      );
    } finally {
      setIsDeletingRestaurantTypeId(null);
    }
  };

  const startEditingRestaurantType = (restaurantType: RestaurantTypeRecord) => {
    setEditingRestaurantTypeId(restaurantType.id);
    setEditingRestaurantName(restaurantType.restaurant_type);
  };

  const handleAddShopType = async () => {
    if (!token) return;

    const value = newShopType.trim();
    if (!value) {
      setLoadError("Shop type is required.");
      return;
    }

    try {
      setLoadError(null);
      setIsAddingShopType(true);
      const created = await createShopType(token, value);
      setShopTypes((current) => {
        const next = [created, ...current];
        next.sort((a, b) =>
          a.shop_type.localeCompare(b.shop_type, "en", {
            sensitivity: "base",
          }),
        );
        return next;
      });
      setNewShopType("");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to add shop type.",
      );
    } finally {
      setIsAddingShopType(false);
    }
  };

  const handleEditShopType = async () => {
    if (!token || editingShopTypeId === null) return;

    const value = editingShopName.trim();
    if (!value) {
      setLoadError("Shop type is required.");
      return;
    }

    try {
      setLoadError(null);
      const updated = await updateShopType(token, editingShopTypeId, value);
      setShopTypes((current) => {
        const next = current.map((item) =>
          item.id === editingShopTypeId ? updated : item,
        );
        next.sort((a, b) =>
          a.shop_type.localeCompare(b.shop_type, "en", {
            sensitivity: "base",
          }),
        );
        return next;
      });
      setEditingShopTypeId(null);
      setEditingShopName("");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to update shop type.",
      );
    }
  };

  const handleDeleteShopType = async (id: number) => {
    if (
      !token ||
      !window.confirm("Are you sure you want to delete this shop type?")
    )
      return;

    try {
      setLoadError(null);
      setIsDeletingShopTypeId(id);
      await deleteShopType(token, id);
      setShopTypes((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to delete shop type.",
      );
    } finally {
      setIsDeletingShopTypeId(null);
    }
  };

  const startEditingShopType = (shopType: ShopTypeRecord) => {
    setEditingShopTypeId(shopType.id);
    setEditingShopName(shopType.shop_type);
  };

  const addAdminSupportingDocuments = (files: FileList | null) => {
    if (!files?.length) return;

    const nextDocs = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      documentType: "OTHER",
      description: "",
    }));

    setAdminSupportingDocuments((current) => [...current, ...nextDocs]);
  };

  const updateAdminSupportingDocument = (
    id: string,
    updates: Partial<
      Pick<SupportingDocumentDraft, "documentType" | "description">
    >,
  ) => {
    setAdminSupportingDocuments((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
    );
  };

  const removeAdminSupportingDocument = (id: string) => {
    setAdminSupportingDocuments((current) =>
      current.filter((doc) => doc.id !== id),
    );
  };

  const handleUploadBusinessDocuments = async () => {
    if (
      !token ||
      selectedBusinessId === null ||
      adminSupportingDocuments.length === 0
    )
      return;

    try {
      setLoadError(null);
      setIsUploadingBusinessDocs(true);
      const docs = adminSupportingDocuments.map(
        (doc): SupportingDocumentInput => ({
          file: doc.file,
          documentType: doc.documentType,
          description: doc.description,
        }),
      );
      const uploaded = await uploadBusinessSupportingDocumentsByBusinessId(
        token,
        selectedBusinessId,
        docs,
      );
      setSelectedBusinessDetails((current) =>
        current
          ? {
              ...current,
              supporting_documents: uploaded,
            }
          : current,
      );
      setAdminSupportingDocuments([]);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to upload supporting documents.",
      );
    } finally {
      setIsUploadingBusinessDocs(false);
    }
  };

  const handleDeleteBusinessDocument = async (documentId: number) => {
    if (!token || selectedBusinessId === null) return;

    try {
      setLoadError(null);
      setIsDeletingBusinessDocId(documentId);
      const documents = await deleteBusinessSupportingDocumentByBusinessId(
        token,
        selectedBusinessId,
        documentId,
      );
      setSelectedBusinessDetails((current) =>
        current
          ? {
              ...current,
              supporting_documents: documents,
            }
          : current,
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to delete supporting document.",
      );
    } finally {
      setIsDeletingBusinessDocId(null);
    }
  };

  if (!user || (!hasRole(user, "admin") && user.role !== "admin"))
    return (
      <div className="p-10 text-center">
        Access denied.{" "}
        <Link to="/login" className="text-blue-600 underline">
          Login as admin
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 sm:flex">
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#1a1a2e] text-white shadow-2xl transition-transform duration-300 sm:static sm:inset-auto sm:z-auto sm:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 ${sidebarOpen ? "sm:w-60" : "sm:w-16"} min-h-screen`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#1a1a2e] font-black text-xs">RW</span>
          </div>
          {sidebarOpen && (
            <span className="font-black text-sm tracking-tight">
              Enjoy Rwanda
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ tab: t, icon, label }) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                closeSidebarIfMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <IconComponent name={icon} size="w-5 h-5" />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && t === "vendors" && pendingApprovals > 0 && (
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingApprovals}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/50">Admin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={`ml-auto rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 ${sidebarOpen ? "" : "px-2"}`}
              aria-label="Sign out"
              title="Sign out"
            >
              {sidebarOpen ? "Sign out" : "✕"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <IconComponent name={navItems.find((n) => n.tab === tab)?.icon || "overview"} size="w-6 h-6" />
                {navItems.find((n) => n.tab === tab)?.label}
              </h1>
              <p className="text-xs text-slate-400">
                Welcome back, {user.name?.split(" ")[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingApprovals > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                {pendingApprovals} pending approval
                {pendingApprovals > 1 ? "s" : ""}
              </span>
            )}
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {loadError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {isLoading && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading latest dashboard data...
            </div>
          )}

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Users",
                    value: users.length,
                    icon: "user",
                    color: "bg-blue-50 text-blue-700",
                  },
                  {
                    label: "Approved Vendors",
                    value: approvedVendors,
                    icon: "vendors",
                    color: "bg-green-50 text-green-700",
                  },
                  {
                    label: "Total Orders",
                    value: 40,
                    icon: "shopping",
                    color: "bg-purple-50 text-purple-700",
                  },
                  {
                    label: "Pending Approvals",
                    value: pendingApprovals,
                    icon: "clock",
                    color: "bg-yellow-50 text-yellow-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color}`}
                      >
                        {item.label}
                      </span>
                      <span className={item.color}>
                        <IconComponent name={item.icon} size="w-6 h-6" />
                      </span>
                    </div>
                    <p className="text-4xl font-black text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Recent Activity
                  </h3>
                  <ul className="space-y-3">
                    {[
                      {
                        icon: "calendar",
                        title: "New booking from Alice Uwase",
                        time: "2 min ago",
                      },
                      {
                        icon: "shopping",
                        title: "New order ORD-011 received",
                        time: "15 min ago",
                      },
                      {
                        icon: "vendors",
                        title: "Vendor Diane Uwimana registered",
                        time: "1 hr ago",
                      },
                      {
                        icon: "message",
                        title: "Support ticket from Jean Pierre",
                        time: "3 hr ago",
                      },
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-slate-600 mt-0.5 flex-shrink-0">
                          <IconComponent name={a.icon} size="w-5 h-5" />
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">
                            {a.title}
                          </p>
                          <p className="text-slate-400 text-xs">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pending Vendors */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Pending Vendor Approvals
                  </h3>
                  {vendorApplications.filter((app) => app.status === "pending")
                    .length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6 flex items-center justify-center gap-2">
                      All vendors approved <IconComponent name="checkmark" size="w-4 h-4" />
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {vendorApplications
                        .filter((app) => app.status === "pending")
                        .map((app) => (
                          <li
                            key={app.id}
                            className="flex items-center justify-between text-sm border border-slate-100 rounded-xl p-3"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {app.vendor_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {app.vendor_email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  void handleReviewApplication(
                                    app.id,
                                    "approved",
                                  )
                                }
                                className="bg-green-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  void handleReviewApplication(
                                    app.id,
                                    "rejected",
                                  )
                                }
                                className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Restaurant Types
                    </h3>
                    <p className="text-sm text-slate-500">
                      Add options used in vendor onboarding business
                      description.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {restaurantTypes.length} type
                    {restaurantTypes.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    value={newRestaurantType}
                    onChange={(event) =>
                      setNewRestaurantType(event.target.value)
                    }
                    placeholder="e.g. Fast Food"
                    className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a2e]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleAddRestaurantType()}
                    disabled={isAddingRestaurantType}
                    className="rounded-xl bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d2d4e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingRestaurantType ? "Adding..." : "Add Type"}
                  </button>
                </div>

                {restaurantTypes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No restaurant types found yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {restaurantTypes.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-200"
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {item.restaurant_type}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingRestaurantType(item)}
                            className="text-xs px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:border-blue-300 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              void handleDeleteRestaurantType(item.id)
                            }
                            disabled={isDeletingRestaurantTypeId === item.id}
                            className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-medium disabled:opacity-50"
                          >
                            {isDeletingRestaurantTypeId === item.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingRestaurantTypeId !== null && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-900 mb-3 font-semibold">
                      Edit Restaurant Type
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={editingRestaurantName}
                        onChange={(e) =>
                          setEditingRestaurantName(e.target.value)
                        }
                        placeholder="Enter restaurant type name"
                        className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => void handleEditRestaurantType()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingRestaurantTypeId(null);
                          setEditingRestaurantName("");
                        }}
                        className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Shop Types</h3>
                    <p className="text-sm text-slate-500">
                      Add options used in vendor onboarding for shop
                      categorization.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {shopTypes.length} type
                    {shopTypes.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    value={newShopType}
                    onChange={(event) => setNewShopType(event.target.value)}
                    placeholder="e.g. Electronics"
                    className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a2e]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleAddShopType()}
                    disabled={isAddingShopType}
                    className="rounded-xl bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d2d4e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingShopType ? "Adding..." : "Add Type"}
                  </button>
                </div>

                {shopTypes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No shop types found yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shopTypes.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-200"
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {item.shop_type}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingShopType(item)}
                            className="text-xs px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:border-blue-300 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDeleteShopType(item.id)}
                            disabled={isDeletingShopTypeId === item.id}
                            className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-medium disabled:opacity-50"
                          >
                            {isDeletingShopTypeId === item.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingShopTypeId !== null && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-900 mb-3 font-semibold">
                      Edit Shop Type
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={editingShopName}
                        onChange={(e) => setEditingShopName(e.target.value)}
                        placeholder="Enter shop type name"
                        className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => void handleEditShopType()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingShopTypeId(null);
                          setEditingShopName("");
                        }}
                        className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    All Users
                  </h2>
                  <p className="text-sm text-slate-400">
                    {users.length} registered users
                  </p>
                </div>
                <button className="bg-[#1a1a2e] !text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2d2d4e]">
                  + Invite User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      {["Name", "Email", "Role", "Status", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="pb-3 font-semibold text-xs uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="py-3 font-medium text-slate-900">
                          {u.name}
                        </td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3">
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            active
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Vendors ── */}
          {tab === "vendors" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">
                      Vendor Applications
                    </h2>
                    <p className="text-sm text-slate-400">
                      {pendingApplications} pending submissions
                    </p>
                  </div>
                  <button
                    onClick={() => void refreshApplications()}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300"
                  >
                    Refresh
                  </button>
                </div>

                {vendorApplications.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                    No vendor submissions yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          {[
                            "Vendor",
                            "Email",
                            "Checklist",
                            "Status",
                            "Submitted",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="pb-3 font-semibold text-xs uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vendorApplications.map((app) => {
                          const checklist = getApplicationChecklist(app);
                          return (
                            <tr
                              key={app.id}
                              className="border-b border-slate-100 hover:bg-slate-50 transition"
                            >
                              <td className="py-3 font-medium text-slate-900">
                                {app.vendor_name}
                              </td>
                              <td className="py-3 text-slate-500">
                                {app.vendor_email}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    checklist.isComplete
                                      ? "bg-green-50 text-green-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {checklist.isComplete
                                    ? "Complete"
                                    : `Missing ${checklist.missing.length}`}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    app.status === "approved"
                                      ? "bg-green-50 text-green-700"
                                      : app.status === "rejected"
                                        ? "bg-red-50 text-red-700"
                                        : app.status === "pending"
                                          ? "bg-yellow-50 text-yellow-700"
                                          : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-500">
                                {app.submitted_at
                                  ? new Date(app.submitted_at).toLocaleString()
                                  : "-"}
                              </td>
                              <td className="py-3">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() =>
                                      setSelectedApplicationId(app.id)
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
                                  >
                                    View
                                  </button>
                                  {app.status === "pending" ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          void handleReviewApplication(
                                            app.id,
                                            "approved",
                                          )
                                        }
                                        disabled={!checklist.isComplete}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold !text-white ${
                                          checklist.isComplete
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-slate-300 cursor-not-allowed"
                                        }`}
                                        title={
                                          checklist.isComplete
                                            ? "Approve"
                                            : "Complete the checklist first"
                                        }
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          void handleReviewApplication(
                                            app.id,
                                            "rejected",
                                          )
                                        }
                                        className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-400 self-center">
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
                  <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                          Vendor application
                        </p>
                        <h3 className="mt-2 text-xl font-black text-slate-900">
                          {selectedApplication.vendor_name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {selectedApplication.vendor_email}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedApplicationId(null)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300"
                      >
                        Close
                      </button>
                    </div>

                    {(() => {
                      const checklist =
                        getApplicationChecklist(selectedApplication);
                      const payloadInput = selectedApplication.payload;
                      const payloadParsed =
                        typeof payloadInput === "string"
                          ? (() => {
                              try {
                                return JSON.parse(payloadInput) as unknown;
                              } catch {
                                return {};
                              }
                            })()
                          : payloadInput;
                      const payload = (payloadParsed ?? {}) as {
                        profile?: Record<string, unknown>;
                        business?: Record<string, unknown>;
                      };
                      const profile = (payload.profile ?? {}) as Record<
                        string,
                        unknown
                      >;
                      const business = (payload.business ?? {}) as Record<
                        string,
                        unknown
                      >;

                      const uploadName = (value: unknown) => {
                        const upload = value as { name?: unknown } | undefined;
                        return upload && typeof upload.name === "string"
                          ? upload.name
                          : "Not uploaded";
                      };

                      const getUpload = (value: unknown) => {
                        const upload = value as
                          | {
                              name?: unknown;
                              type?: unknown;
                              dataUrl?: unknown;
                              size?: unknown;
                            }
                          | undefined;
                        if (!upload || typeof upload !== "object") return null;
                        const name =
                          typeof upload.name === "string" ? upload.name : null;
                        if (!name) return null;
                        const type =
                          typeof upload.type === "string" ? upload.type : "";
                        const dataUrl =
                          typeof upload.dataUrl === "string"
                            ? upload.dataUrl
                            : null;
                        const size =
                          typeof upload.size === "number" ? upload.size : null;
                        return { name, type, dataUrl, size };
                      };

                      const renderUploadActions = (value: unknown) => {
                        const upload = getUpload(value);
                        if (!upload)
                          return (
                            <span className="text-slate-400">Not uploaded</span>
                          );
                        if (!upload.dataUrl)
                          return (
                            <span className="text-slate-400">
                              Stored as filename only (too large to preview)
                            </span>
                          );
                        return (
                          <div className="flex items-center gap-3">
                            <a
                              href={upload.dataUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-slate-900 hover:underline"
                            >
                              Open
                            </a>
                            <a
                              href={upload.dataUrl}
                              download={upload.name}
                              className="font-semibold text-slate-900 hover:underline"
                            >
                              Download
                            </a>
                          </div>
                        );
                      };

                      const renderUploadPreview = (value: unknown) => {
                        const upload = getUpload(value);
                        if (!upload?.dataUrl) return null;
                        if (upload.type.startsWith("image/")) {
                          return (
                            <img
                              alt={upload.name}
                              src={upload.dataUrl}
                              className="mt-3 h-32 w-full rounded-2xl object-cover border border-slate-200"
                            />
                          );
                        }
                        if (upload.type === "application/pdf") {
                          return (
                            <iframe
                              title={upload.name}
                              src={upload.dataUrl}
                              className="mt-3 h-40 w-full rounded-2xl border border-slate-200"
                            />
                          );
                        }
                        return null;
                      };

                      return (
                        <div className="mt-6 space-y-6">
                          <div
                            className={`rounded-2xl p-4 text-sm ${checklist.isComplete ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}
                          >
                            <p className="font-semibold">
                              {checklist.isComplete
                                ? "All requirements are complete."
                                : "Missing requirements:"}
                            </p>
                            {!checklist.isComplete && (
                              <ul className="mt-2 list-disc pl-5">
                                {checklist.missing.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <h4 className="font-bold text-slate-900 mb-3">
                                Profile
                              </h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <p>
                                  <span className="text-slate-500">
                                    Owner name:
                                  </span>{" "}
                                  {String(profile.ownerName ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Owner email:
                                  </span>{" "}
                                  {String(profile.email ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Owner phone:
                                  </span>{" "}
                                  {String(profile.phone ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Description:
                                  </span>{" "}
                                  {String(profile.description ?? "-")}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4">
                              <h4 className="font-bold text-slate-900 mb-3">
                                Business
                              </h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <p>
                                  <span className="text-slate-500">Name:</span>{" "}
                                  {String(business.businessName ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">Type:</span>{" "}
                                  {String(business.businessType ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Location:
                                  </span>{" "}
                                  {String(business.location ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Business email:
                                  </span>{" "}
                                  {String(business.businessEmail ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Business phone:
                                  </span>{" "}
                                  {String(business.businessPhone ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Manager:
                                  </span>{" "}
                                  {String(business.managerName ?? "-")} (
                                  {String(business.managerEmail ?? "-")})
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Opening hours:
                                  </span>{" "}
                                  {String(business.openingHours ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Website:
                                  </span>{" "}
                                  {String(business.website ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Tables:
                                  </span>{" "}
                                  {String(business.tablesCount ?? "-")} ·{" "}
                                  <span className="text-slate-500">
                                    Capacity:
                                  </span>{" "}
                                  {String(business.capacity ?? "-")}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Categories:
                                  </span>{" "}
                                  {Array.isArray(business.categories)
                                    ? business.categories.join(", ")
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-4">
                            <h4 className="font-bold text-slate-900 mb-3">
                              Documents
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">
                                  Profile image
                                </p>
                                <p className="mt-1 font-semibold">
                                  {uploadName(business.profileImage)}
                                </p>
                                <div className="mt-2 text-xs">
                                  {renderUploadActions(business.profileImage)}
                                </div>
                                {renderUploadPreview(business.profileImage)}
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">
                                  Menu PDF
                                </p>
                                <p className="mt-1 font-semibold">
                                  {uploadName(business.menuPdf)}
                                </p>
                                <div className="mt-2 text-xs">
                                  {renderUploadActions(business.menuPdf)}
                                </div>
                                {renderUploadPreview(business.menuPdf)}
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">
                                  RDB certificate
                                </p>
                                <p className="mt-1 font-semibold">
                                  {uploadName(business.rdbCertificate)}
                                </p>
                                <div className="mt-2 text-xs">
                                  {renderUploadActions(business.rdbCertificate)}
                                </div>
                                {renderUploadPreview(business.rdbCertificate)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 justify-end">
                            <button
                              onClick={() => setSelectedApplicationId(null)}
                              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300"
                            >
                              Close
                            </button>
                            {selectedApplication.status === "pending" && (
                              <button
                                onClick={() => {
                                  void handleReviewApplication(
                                    selectedApplication.id,
                                    "approved",
                                  );
                                  setSelectedApplicationId(null);
                                }}
                                disabled={!checklist.isComplete}
                                className={`rounded-xl px-5 py-3 text-sm font-semibold !text-white ${
                                  checklist.isComplete
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-slate-300 cursor-not-allowed"
                                }`}
                                title={
                                  checklist.isComplete
                                    ? "Approve vendor application"
                                    : "Complete the checklist first"
                                }
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">
                      Registered Businesses
                    </h2>
                    <p className="text-sm text-slate-400">
                      {businessProfiles.length} business profile
                      {businessProfiles.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {businessProfiles.length} active
                  </span>
                </div>
                {businessProfiles.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                    No businesses found in the database.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          {[
                            "Business",
                            "Owner",
                            "Type",
                            "Location",
                            "Verified",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="pb-3 font-semibold text-xs uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {businessProfiles.map((business) => (
                          <tr
                            key={
                              business.business_id ??
                              `${business.user_id}-${business.business_name}`
                            }
                            className="border-b border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="py-3 font-medium text-slate-900">
                              {business.business_name}
                            </td>
                            <td className="py-3 text-slate-600">
                              <p className="font-medium text-slate-800">
                                {business.owner_name ?? "-"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {business.owner_email ?? "-"}
                              </p>
                            </td>
                            <td className="py-3 text-slate-600">
                              {business.business_type ?? "-"}
                            </td>
                            <td className="py-3 text-slate-500">
                              {business.location ?? "-"}
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleToggleBusinessVerification(
                                    business,
                                  )
                                }
                                disabled={
                                  isTogglingBusinessId ===
                                    business.business_id ||
                                  typeof business.business_id !== "number"
                                }
                                className={`rounded-full px-3 py-1 text-xs font-semibold !text-white ${
                                  business.is_verified
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-slate-500 hover:bg-slate-600"
                                } ${
                                  isTogglingBusinessId === business.business_id
                                    ? "opacity-70 cursor-wait"
                                    : ""
                                }`}
                              >
                                {business.is_verified ? "On" : "Off"}
                              </button>
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedBusinessId(
                                    business.business_id ?? null,
                                  )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "vendors" && selectedBusinessForModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
              <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Business profile
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">
                      {selectedBusinessForModal.business_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedBusinessForModal.business_type ?? "Type not set"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBusinessId(null)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h4 className="mb-3 font-bold text-slate-900">Owner</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="text-slate-500">Name:</span>{" "}
                        {selectedBusinessForModal.owner_name ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Email:</span>{" "}
                        {selectedBusinessForModal.owner_email ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Phone:</span>{" "}
                        {selectedBusinessForModal.owner_phone ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Verification:</span>{" "}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            selectedBusinessForModal.is_verified
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {selectedBusinessForModal.is_verified
                            ? "Verified"
                            : "Not verified"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h4 className="mb-3 font-bold text-slate-900">Business</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="text-slate-500">Location:</span>{" "}
                        {selectedBusinessForModal.location ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Business email:</span>{" "}
                        {selectedBusinessForModal.business_email ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Business phone:</span>{" "}
                        {selectedBusinessForModal.business_phone ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Manager:</span>{" "}
                        {selectedBusinessForModal.manager_name ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Manager email:</span>{" "}
                        {selectedBusinessForModal.manager_email ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Opening hours:</span>{" "}
                        {selectedBusinessForModal.opening_hours ?? "-"}
                      </p>
                      <p>
                        <span className="text-slate-500">Opening days:</span>{" "}
                        {Array.isArray(selectedBusinessForModal.opening_days)
                          ? selectedBusinessForModal.opening_days.join(", ")
                          : (selectedBusinessForModal.opening_days ?? "-")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                  <h4 className="mb-3 font-bold text-slate-900">
                    Description & files
                  </h4>
                  <p className="mb-4 text-sm text-slate-700">
                    {selectedBusinessForModal.business_description ??
                      "No description provided."}
                  </p>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Profile image
                      </p>
                      {selectedBusinessForModal.business_profile_image ? (
                        <a
                          className="mt-1 block font-semibold text-slate-900 hover:underline"
                          href={selectedBusinessForModal.business_profile_image}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file
                        </a>
                      ) : (
                        <p className="mt-1 text-slate-400">Not uploaded</p>
                      )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        RDB certificate
                      </p>
                      {selectedBusinessForModal.rdb_certificate ? (
                        <a
                          className="mt-1 block font-semibold text-slate-900 hover:underline"
                          href={selectedBusinessForModal.rdb_certificate}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file
                        </a>
                      ) : (
                        <p className="mt-1 text-slate-400">Not uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">
                        Supporting documents
                      </h4>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {
                          (selectedBusinessForModal.supporting_documents ?? [])
                            .length
                        }
                      </span>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/*,.doc,.docx"
                      onChange={(event) => {
                        addAdminSupportingDocuments(event.target.files);
                        event.currentTarget.value = "";
                      }}
                      className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    />

                    {adminSupportingDocuments.length > 0 && (
                      <div className="mb-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {adminSupportingDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-[2fr_1fr_auto]"
                          >
                            <div className="space-y-1">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {doc.file.name}
                              </p>
                              <input
                                value={doc.description}
                                onChange={(event) =>
                                  updateAdminSupportingDocument(doc.id, {
                                    description: event.target.value,
                                  })
                                }
                                placeholder="Description (optional)"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <select
                              value={doc.documentType}
                              onChange={(event) =>
                                updateAdminSupportingDocument(doc.id, {
                                  documentType: event.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none"
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
                              onClick={() =>
                                removeAdminSupportingDocument(doc.id)
                              }
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => void handleUploadBusinessDocuments()}
                          disabled={isUploadingBusinessDocs}
                          className="rounded-lg bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploadingBusinessDocs
                            ? "Uploading..."
                            : "Upload new documents"}
                        </button>
                      </div>
                    )}

                    {(selectedBusinessForModal.supporting_documents ?? [])
                      .length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No supporting documents uploaded yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {(
                          selectedBusinessForModal.supporting_documents ?? []
                        ).map((doc) => (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">
                                {doc.document_type || "OTHER"}
                              </p>
                              {doc.description && (
                                <p className="text-slate-500">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                className="font-semibold text-slate-900 underline"
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeleteBusinessDocument(doc.id)
                                }
                                disabled={isDeletingBusinessDocId === doc.id}
                                className="rounded-md border border-rose-200 px-2 py-1 font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isDeletingBusinessDocId === doc.id
                                  ? "Removing..."
                                  : "Delete"}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Document Control Center
                    </h2>
                    <p className="text-sm text-slate-500">
                      Manage supporting files for every business profile.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {businessProfiles.length} businesses
                    </span>
                    <span className="rounded-full bg-[#1a1a2e]/10 px-3 py-1 text-xs font-semibold text-[#1a1a2e]">
                      {
                        (selectedBusinessForModal?.supporting_documents ?? [])
                          .length
                      }{" "}
                      docs selected
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">Businesses</h3>
                    <input
                      value={documentBusinessQuery}
                      onChange={(event) =>
                        setDocumentBusinessQuery(event.target.value)
                      }
                      placeholder="Search business, owner, location..."
                      className="w-full max-w-[260px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#1a1a2e]"
                    />
                  </div>

                  {filteredBusinessesForDocuments.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No businesses match your search.
                    </p>
                  ) : (
                    <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
                      {filteredBusinessesForDocuments.map((business) => {
                        const isSelected =
                          selectedBusinessId === business.business_id;

                        return (
                          <button
                            key={
                              business.business_id ??
                              `${business.user_id}-${business.business_name}`
                            }
                            type="button"
                            onClick={() =>
                              setSelectedBusinessId(
                                business.business_id ?? null,
                              )
                            }
                            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-[#1a1a2e] bg-[#1a1a2e]/5"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {business.business_name}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  business.is_verified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {business.is_verified
                                  ? "Verified"
                                  : "Unverified"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {(business.business_type ?? "-") +
                                " · " +
                                (business.location ?? "-")}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {business.owner_email ?? "No owner email"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {!selectedBusinessForModal ? (
                    <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Select a business to manage documents
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          You can upload new files, view existing files, and
                          delete outdated documents.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Selected business
                          </p>
                          <h3 className="mt-1 text-lg font-black text-slate-900">
                            {selectedBusinessForModal.business_name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {selectedBusinessForModal.business_type ?? "-"} ·{" "}
                            {selectedBusinessForModal.location ?? "-"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBusinessId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Upload New Supporting Documents
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="application/pdf,image/*,.doc,.docx"
                          onChange={(event) => {
                            addAdminSupportingDocuments(event.target.files);
                            event.currentTarget.value = "";
                          }}
                          className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        />

                        {adminSupportingDocuments.length > 0 && (
                          <div className="space-y-2">
                            {adminSupportingDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[2fr_1fr_auto]"
                              >
                                <div className="space-y-1">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {doc.file.name}
                                  </p>
                                  <input
                                    value={doc.description}
                                    onChange={(event) =>
                                      updateAdminSupportingDocument(doc.id, {
                                        description: event.target.value,
                                      })
                                    }
                                    placeholder="Description (optional)"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none"
                                  />
                                </div>
                                <select
                                  value={doc.documentType}
                                  onChange={(event) =>
                                    updateAdminSupportingDocument(doc.id, {
                                      documentType: event.target.value,
                                    })
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none"
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
                                  onClick={() =>
                                    removeAdminSupportingDocument(doc.id)
                                  }
                                  className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                void handleUploadBusinessDocuments()
                              }
                              disabled={isUploadingBusinessDocs}
                              className="rounded-lg bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUploadingBusinessDocs
                                ? "Uploading..."
                                : "Upload documents"}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Existing Documents
                          </p>
                          <select
                            value={documentTypeFilter}
                            onChange={(event) =>
                              setDocumentTypeFilter(event.target.value)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none"
                          >
                            <option value="ALL">All types</option>
                            <option value="OTHER">OTHER</option>
                            <option value="NID">NID</option>
                            <option value="LICENSE">LICENSE</option>
                            <option value="TAX_CERTIFICATE">
                              TAX_CERTIFICATE
                            </option>
                          </select>
                        </div>

                        {filteredSelectedBusinessDocuments.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No documents found for the selected filter.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {filteredSelectedBusinessDocuments.map((doc) => (
                              <li
                                key={doc.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                              >
                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {doc.document_type || "OTHER"}
                                  </p>
                                  {doc.description && (
                                    <p className="text-slate-500">
                                      {doc.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    className="font-semibold text-slate-900 underline"
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleDeleteBusinessDocument(doc.id)
                                    }
                                    disabled={
                                      isDeletingBusinessDocId === doc.id
                                    }
                                    className="rounded-md border border-rose-200 px-2 py-1 font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDeletingBusinessDocId === doc.id
                                      ? "Removing..."
                                      : "Delete"}
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {tab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    title: "Orders This Month",
                    value: "40",
                    detail: "+12% from last month",
                    icon: "shopping",
                  },
                  {
                    title: "Revenue",
                    value: "580,000 RWF",
                    detail: "+8% from last month",
                    icon: "shopping",
                  },
                  {
                    title: "Bookings",
                    value: "18",
                    detail: "+5% from last month",
                    icon: "calendar",
                  },
                  {
                    title: "Complaints",
                    value: "2",
                    detail: "1 resolved, 1 pending",
                    icon: "message",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">
                        <IconComponent name={item.icon} size="w-6 h-6" />
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        This month
                      </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">
                  Platform Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    {
                      label: "Total Revenue",
                      value: "2,450,000 RWF",
                      icon: "shopping",
                    },
                    { label: "Total Bookings", value: "86", icon: "calendar" },
                    {
                      label: "Active Vendors",
                      value: approvedVendors.toString(),
                      icon: "vendors",
                    },
                    {
                      label: "Registered Users",
                      value: users.length.toString(),
                      icon: "users",
                    },
                    {
                      label: "Avg Order Value",
                      value: "14,500 RWF",
                      icon: "shopping",
                    },
                    { label: "Satisfaction Rate", value: "94%", icon: "checkmark" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 border border-slate-100 rounded-xl p-4"
                    >
                      <span className="text-slate-600">
                        <IconComponent name={item.icon} size="w-6 h-6" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{item.value}</p>
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
