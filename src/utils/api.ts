const API_BASE_FROM_ENV = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const DEFAULT_BASE_URL = "https://enjoy-rwanda-bn-5.onrender.com/api";

export const BASE_URL = (API_BASE_FROM_ENV && API_BASE_FROM_ENV.length > 0
  ? API_BASE_FROM_ENV
  : DEFAULT_BASE_URL
).replace(/\/+$/, "");

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
}

export interface BusinessProfileRecord {
  business_id?: number;
  user_id?: number;
  business_name: string;
  business_type: string | null;
  business_description: string | null;
  location: string | null;
  business_phone: string | null;
  business_email: string | null;
  opening_hours: string | null;
  opening_days: string | string[] | null;
  manager_name: string | null;
  manager_email: string | null;
  business_profile_image: string | null;
  rdb_certificate: string | null;
}

export type BusinessProfileFormInput = {
  businessName: string;
  businessType: string;
  businessDescription: string;
  location: string;
  businessPhone: string;
  businessEmail: string;
  openingHours: string;
  openingDays: string[];
  managerName: string;
  managerEmail: string;
  businessProfileImageFile?: File | null;
  rdbCertificateFile?: File | null;
};

export type MenuItemCreateInput = {
  name: string;
  description: string;
  price: number;
  available?: boolean;
  imageFile?: File | null;
};

export interface MenuItemRecord {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  price: number;
  available: number;
  imageurl: string | null;
}

function toErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallback;
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(toErrorMessage(data, "Request failed"));
  return data as T;
}

function buildBusinessProfileFormData(input: BusinessProfileFormInput) {
  const formData = new FormData();
  formData.append("business_name", input.businessName);
  formData.append("business_type", input.businessType);
  formData.append("business_description", input.businessDescription);
  formData.append("location", input.location);
  formData.append("business_phone", input.businessPhone);
  formData.append("business_email", input.businessEmail);
  formData.append("opening_hours", input.openingHours);
  formData.append("opening_days", JSON.stringify(input.openingDays));
  formData.append("manager_name", input.managerName);
  formData.append("manager_email", input.managerEmail);

  if (input.businessProfileImageFile) {
    formData.append("business_profile_image", input.businessProfileImageFile);
  }

  if (input.rdbCertificateFile) {
    formData.append("rdb_certificate", input.rdbCertificateFile);
  }

  return formData;
}

function buildMenuItemFormData(input: MenuItemCreateInput) {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("description", input.description);
  formData.append("price", String(input.price));
  formData.append("available", input.available === false ? "0" : "1");

  if (input.imageFile) {
    formData.append("image", input.imageFile);
  }

  return formData;
}

export async function apiLogin(email: string, password: string) {
  return requestJson<{ token: string; user: AuthUser }>(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name: string, email: string, password: string, phone?: string, role: string = "vendor") {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone, role }),
  });
}

export async function getMyBusinessProfile(token: string) {
  const res = await fetch(`${BASE_URL}/business-profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);
  if (res.status === 404) {
    const message = toErrorMessage(data, "Not found");
    if (message.toLowerCase().includes("business profile not found")) {
      return null;
    }
    throw new Error(
      "Business profile endpoint is unavailable on the current backend deployment. Redeploy backend with business routes.",
    );
  }

  if (!res.ok) throw new Error(toErrorMessage(data, "Failed to load business profile"));
  return data as BusinessProfileRecord;
}

export async function createBusinessProfile(token: string, input: BusinessProfileFormInput) {
  const res = await fetch(`${BASE_URL}/business-profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: buildBusinessProfileFormData(input),
  });

  const data = await res.json().catch(() => null);
  if (res.status === 404) {
    throw new Error(
      "Business profile endpoint is unavailable on the current backend deployment. Redeploy backend with business routes.",
    );
  }
  if (!res.ok) throw new Error(toErrorMessage(data, "Failed to create business profile"));
  return data as BusinessProfileRecord;
}

export async function updateMyBusinessProfile(token: string, input: BusinessProfileFormInput) {
  const res = await fetch(`${BASE_URL}/business-profile/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: buildBusinessProfileFormData(input),
  });

  const data = await res.json().catch(() => null);
  if (res.status === 404) {
    throw new Error(
      "Business profile endpoint is unavailable on the current backend deployment. Redeploy backend with business routes.",
    );
  }
  if (!res.ok) throw new Error(toErrorMessage(data, "Failed to update business profile"));
  return data as BusinessProfileRecord;
}

export async function createMenuItem(token: string, input: MenuItemCreateInput) {
  const res = await fetch(`${BASE_URL}/menu`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: buildMenuItemFormData(input),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(toErrorMessage(data, "Failed to create menu item"));
  return data as MenuItemRecord;
}
