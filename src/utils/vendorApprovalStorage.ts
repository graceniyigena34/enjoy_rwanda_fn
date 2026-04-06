export type VendorApprovalStatus = "draft" | "pending" | "approved" | "rejected";

export type VendorApplication = {
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  status: VendorApprovalStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerName?: string;
  rejectionReason?: string;
  payload?: {
    profile?: unknown;
    business?: unknown;
  };
};

const STORAGE_KEY = "enjoy-rwanda.vendorApprovals.v1";

const safeParse = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const readVendorApplications = (): VendorApplication[] => {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry): entry is VendorApplication => {
    if (!entry || typeof entry !== "object") return false;
    const record = entry as Partial<VendorApplication>;
    return typeof record.vendorId === "number" && typeof record.status === "string" && typeof record.vendorName === "string" && typeof record.vendorEmail === "string";
  });
};

export const writeVendorApplications = (apps: VendorApplication[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
};

export const getVendorApplication = (vendorId: number) => readVendorApplications().find((app) => app.vendorId === vendorId) ?? null;

export const upsertVendorApplication = (application: VendorApplication) => {
  const apps = readVendorApplications();
  const index = apps.findIndex((app) => app.vendorId === application.vendorId);
  if (index === -1) apps.push(application);
  else apps[index] = application;
  writeVendorApplications(apps);
};

export const updateVendorApplicationStatus = (vendorId: number, patch: Partial<VendorApplication>) => {
  const apps = readVendorApplications();
  const index = apps.findIndex((app) => app.vendorId === vendorId);
  if (index === -1) return;
  apps[index] = { ...apps[index], ...patch };
  writeVendorApplications(apps);
};

