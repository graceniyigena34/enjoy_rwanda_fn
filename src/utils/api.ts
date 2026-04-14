const BASE_URL = "https://enjoy-rwanda-bn-5.onrender.com/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as { token: string; user: AuthUser };
}

export async function apiRegister(name: string, email: string, password: string, role: string = "vendor") {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data as { token: string; user: AuthUser };
}
