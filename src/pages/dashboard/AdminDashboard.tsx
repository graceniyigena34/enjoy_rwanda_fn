import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { readVendorApplications, updateVendorApplicationStatus } from "../../utils/vendorApprovalStorage";

const mockUsers = [
  { id: 1, name: "Alice Uwase", email: "alice@demo.com", role: "visitor", status: "active" },
  { id: 2, name: "Bob Nkurunziza", email: "bob@demo.com", role: "vendor", status: "active" },
  { id: 3, name: "Claire Mukamana", email: "claire@demo.com", role: "visitor", status: "active" },
];
const mockVendors = [
  { id: 1, name: "Bob Nkurunziza", business: "Kigali Serena Restaurant", type: "Restaurant", status: "approved" },
  { id: 2, name: "Diane Uwimana", business: "Inzozi Fashion", type: "Shop", status: "pending" },
  { id: 3, name: "Eric Habimana", business: "Kigali Fresh Market", type: "Shop", status: "pending" },
];

type Tab = "overview" | "users" | "vendors" | "reports";

const navItems: { tab: Tab; icon: string; label: string }[] = [
  { tab: "overview", icon: "📊", label: "Overview" },
  { tab: "users", icon: "👥", label: "Users" },
  { tab: "vendors", icon: "🏪", label: "Vendors" },
  { tab: "reports", icon: "📈", label: "Reports" },
];

export default function AdminDashboard() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [vendors, setVendors] = useState(mockVendors);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vendorApplications, setVendorApplications] = useState(() => readVendorApplications());
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const closeSidebarIfMobile = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 639px)").matches) setSidebarOpen(false);
  };

  const selectedApplication = useMemo(
    () => (selectedApplicationId === null ? null : vendorApplications.find((app) => app.vendorId === selectedApplicationId) ?? null),
    [selectedApplicationId, vendorApplications]
  );

  const getApplicationChecklist = (application: (typeof vendorApplications)[number]) => {
    const payload = (application.payload ?? {}) as { profile?: Record<string, unknown>; business?: Record<string, unknown> };
    const profile = (payload.profile ?? {}) as Record<string, unknown>;
    const business = (payload.business ?? {}) as Record<string, unknown>;

    const missing: string[] = [];

    const requiredText = (label: string, value: unknown) => {
      if (typeof value !== "string" || value.trim().length === 0) missing.push(label);
    };

    const requiredNumber = (label: string, value: unknown) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) missing.push(label);
    };

    const requiredArray = (label: string, value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) missing.push(label);
    };

    const requiredUpload = (label: string, value: unknown) => {
      const upload = value as { name?: unknown } | undefined;
      if (!upload || typeof upload.name !== "string" || upload.name.trim().length === 0) missing.push(label);
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
    [vendorApplications]
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "enjoy-rwanda.vendorApprovals.v1") return;
      setVendorApplications(readVendorApplications());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const pendingApprovals = vendors.filter(v => v.status === "pending").length;
  const approvedVendors = vendors.filter(v => v.status === "approved").length;

  if (!user || user.role !== "admin")
    return (
      <div className="p-10 text-center">
        Access denied.{" "}
        <Link to="/login" className="text-blue-600 underline">Login as admin</Link>
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
          {sidebarOpen && <span className="font-black text-sm tracking-tight">Enjoy Rwanda</span>}
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
                tab === t ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base shrink-0">{icon}</span>
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && t === "vendors" && pendingApprovals > 0 && (
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingApprovals}</span>
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
              {sidebarOpen ? "Sign out" : "⎋"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="text-slate-500 hover:text-slate-900 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                {navItems.find(n => n.tab === tab)?.icon} {navItems.find(n => n.tab === tab)?.label}
              </h1>
              <p className="text-xs text-slate-400">Welcome back, {user.name?.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingApprovals > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
              </span>
            )}
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">● Live</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: mockUsers.length, icon: "👥", color: "bg-blue-50 text-blue-700" },
                  { label: "Approved Vendors", value: approvedVendors, icon: "🏪", color: "bg-green-50 text-green-700" },
                  { label: "Total Orders", value: 40, icon: "🛒", color: "bg-purple-50 text-purple-700" },
                  { label: "Pending Approvals", value: pendingApprovals, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color}`}>{item.label}</span>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <p className="text-4xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <ul className="space-y-3">
                    {[
                      { icon: "📅", title: "New booking from Alice Uwase", time: "2 min ago" },
                      { icon: "🛒", title: "New order ORD-011 received", time: "15 min ago" },
                      { icon: "🏪", title: "Vendor Diane Uwimana registered", time: "1 hr ago" },
                      { icon: "💬", title: "Support ticket from Jean Pierre", time: "3 hr ago" },
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-base mt-0.5">{a.icon}</span>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{a.title}</p>
                          <p className="text-slate-400 text-xs">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pending Vendors */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Pending Vendor Approvals</h3>
                  {vendors.filter(v => v.status === "pending").length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">All vendors approved ✅</p>
                  ) : (
                    <ul className="space-y-3">
                      {vendors.filter(v => v.status === "pending").map(v => (
                        <li key={v.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-xl p-3">
                          <div>
                            <p className="font-semibold text-slate-900">{v.business}</p>
                            <p className="text-xs text-slate-400">{v.name} · {v.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "approved" } : x))} className="bg-green-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600">Approve</button>
                            <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "rejected" } : x))} className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Reject</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">All Users</h2>
                  <p className="text-sm text-slate-400">{mockUsers.length} registered users</p>
                </div>
                <button className="bg-[#1a1a2e] !text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2d2d4e]">+ Invite User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                        <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3"><span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{u.role}</span></td>
                        <td className="py-3"><span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">{u.status}</span></td>
                        <td className="py-3"><button className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Suspend</button></td>
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
                    <h2 className="font-bold text-slate-900 text-lg">Vendor Applications</h2>
                    <p className="text-sm text-slate-400">{pendingApplications} pending submissions</p>
                  </div>
                  <button onClick={() => setVendorApplications(readVendorApplications())} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300">
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
                          {["Vendor", "Email", "Checklist", "Status", "Submitted", "Actions"].map((h) => (
                            <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vendorApplications.map((app) => {
                          const checklist = getApplicationChecklist(app);
                          return (
                          <tr key={app.vendorId} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="py-3 font-medium text-slate-900">{app.vendorName}</td>
                            <td className="py-3 text-slate-500">{app.vendorEmail}</td>
                            <td className="py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                checklist.isComplete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {checklist.isComplete ? "Complete" : `Missing ${checklist.missing.length}`}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                app.status === "approved" ? "bg-green-50 text-green-700" :
                                app.status === "rejected" ? "bg-red-50 text-red-700" :
                                app.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                                "bg-slate-100 text-slate-700"
                              }`}>{app.status}</span>
                            </td>
                            <td className="py-3 text-slate-500">{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "-"}</td>
                            <td className="py-3">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => setSelectedApplicationId(app.vendorId)}
                                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
                                >
                                  View
                                </button>
                                {app.status === "pending" ? (
                                  <>
                                  <button
                                    onClick={() => {
                                      updateVendorApplicationStatus(app.vendorId, {
                                        status: "approved",
                                        reviewedAt: new Date().toISOString(),
                                        reviewerName: user.name,
                                      });
                                      setVendorApplications(readVendorApplications());
                                    }}
                                    disabled={!checklist.isComplete}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold !text-white ${
                                      checklist.isComplete ? "bg-green-500 hover:bg-green-600" : "bg-slate-300 cursor-not-allowed"
                                    }`}
                                    title={checklist.isComplete ? "Approve" : "Complete the checklist first"}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateVendorApplicationStatus(app.vendorId, {
                                        status: "rejected",
                                        reviewedAt: new Date().toISOString(),
                                        reviewerName: user.name,
                                      });
                                      setVendorApplications(readVendorApplications());
                                    }}
                                    className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600"
                                  >
                                    Reject
                                  </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-400 self-center">Completed</span>
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
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor application</p>
                        <h3 className="mt-2 text-xl font-black text-slate-900">{selectedApplication.vendorName}</h3>
                        <p className="text-sm text-slate-500">{selectedApplication.vendorEmail}</p>
                      </div>
                      <button onClick={() => setSelectedApplicationId(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300">
                        Close
                      </button>
                    </div>

                    {(() => {
                      const checklist = getApplicationChecklist(selectedApplication);
                      const payload = (selectedApplication.payload ?? {}) as { profile?: Record<string, unknown>; business?: Record<string, unknown> };
                      const profile = (payload.profile ?? {}) as Record<string, unknown>;
                      const business = (payload.business ?? {}) as Record<string, unknown>;

                      const uploadName = (value: unknown) => {
                        const upload = value as { name?: unknown } | undefined;
                        return upload && typeof upload.name === "string" ? upload.name : "Not uploaded";
                      };

                      const getUpload = (value: unknown) => {
                        const upload = value as { name?: unknown; type?: unknown; dataUrl?: unknown; size?: unknown } | undefined;
                        if (!upload || typeof upload !== "object") return null;
                        const name = typeof upload.name === "string" ? upload.name : null;
                        if (!name) return null;
                        const type = typeof upload.type === "string" ? upload.type : "";
                        const dataUrl = typeof upload.dataUrl === "string" ? upload.dataUrl : null;
                        const size = typeof upload.size === "number" ? upload.size : null;
                        return { name, type, dataUrl, size };
                      };

                      const renderUploadActions = (value: unknown) => {
                        const upload = getUpload(value);
                        if (!upload) return <span className="text-slate-400">Not uploaded</span>;
                        if (!upload.dataUrl) return <span className="text-slate-400">Stored as filename only (too large to preview)</span>;
                        return (
                          <div className="flex items-center gap-3">
                            <a href={upload.dataUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:underline">Open</a>
                            <a href={upload.dataUrl} download={upload.name} className="font-semibold text-slate-900 hover:underline">Download</a>
                          </div>
                        );
                      };

                      const renderUploadPreview = (value: unknown) => {
                        const upload = getUpload(value);
                        if (!upload?.dataUrl) return null;
                        if (upload.type.startsWith("image/")) {
                          return <img alt={upload.name} src={upload.dataUrl} className="mt-3 h-32 w-full rounded-2xl object-cover border border-slate-200" />;
                        }
                        if (upload.type === "application/pdf") {
                          return (
                            <iframe title={upload.name} src={upload.dataUrl} className="mt-3 h-40 w-full rounded-2xl border border-slate-200" />
                          );
                        }
                        return null;
                      };

                      return (
                        <div className="mt-6 space-y-6">
                          <div className={`rounded-2xl p-4 text-sm ${checklist.isComplete ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
                            <p className="font-semibold">{checklist.isComplete ? "All requirements are complete." : "Missing requirements:"}</p>
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
                              <h4 className="font-bold text-slate-900 mb-3">Profile</h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <p><span className="text-slate-500">Owner name:</span> {String(profile.ownerName ?? "-")}</p>
                                <p><span className="text-slate-500">Owner email:</span> {String(profile.email ?? "-")}</p>
                                <p><span className="text-slate-500">Owner phone:</span> {String(profile.phone ?? "-")}</p>
                                <p><span className="text-slate-500">Description:</span> {String(profile.description ?? "-")}</p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4">
                              <h4 className="font-bold text-slate-900 mb-3">Business</h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <p><span className="text-slate-500">Name:</span> {String(business.businessName ?? "-")}</p>
                                <p><span className="text-slate-500">Type:</span> {String(business.businessType ?? "-")}</p>
                                <p><span className="text-slate-500">Location:</span> {String(business.location ?? "-")}</p>
                                <p><span className="text-slate-500">Business email:</span> {String(business.businessEmail ?? "-")}</p>
                                <p><span className="text-slate-500">Business phone:</span> {String(business.businessPhone ?? "-")}</p>
                                <p><span className="text-slate-500">Manager:</span> {String(business.managerName ?? "-")} ({String(business.managerEmail ?? "-")})</p>
                                <p><span className="text-slate-500">Opening hours:</span> {String(business.openingHours ?? "-")}</p>
                                <p><span className="text-slate-500">Website:</span> {String(business.website ?? "-")}</p>
                                <p><span className="text-slate-500">Tables:</span> {String(business.tablesCount ?? "-")} · <span className="text-slate-500">Capacity:</span> {String(business.capacity ?? "-")}</p>
                                <p><span className="text-slate-500">Categories:</span> {Array.isArray(business.categories) ? business.categories.join(", ") : "-"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-4">
                            <h4 className="font-bold text-slate-900 mb-3">Documents</h4>
                            <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">Profile image</p>
                                <p className="mt-1 font-semibold">{uploadName(business.profileImage)}</p>
                                <div className="mt-2 text-xs">{renderUploadActions(business.profileImage)}</div>
                                {renderUploadPreview(business.profileImage)}
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">Menu PDF</p>
                                <p className="mt-1 font-semibold">{uploadName(business.menuPdf)}</p>
                                <div className="mt-2 text-xs">{renderUploadActions(business.menuPdf)}</div>
                                {renderUploadPreview(business.menuPdf)}
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">RDB certificate</p>
                                <p className="mt-1 font-semibold">{uploadName(business.rdbCertificate)}</p>
                                <div className="mt-2 text-xs">{renderUploadActions(business.rdbCertificate)}</div>
                                {renderUploadPreview(business.rdbCertificate)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 justify-end">
                            <button onClick={() => setSelectedApplicationId(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300">
                              Close
                            </button>
                            {selectedApplication.status === "pending" && (
                              <button
                                onClick={() => {
                                  updateVendorApplicationStatus(selectedApplication.vendorId, {
                                    status: "approved",
                                    reviewedAt: new Date().toISOString(),
                                    reviewerName: user.name,
                                  });
                                  setVendorApplications(readVendorApplications());
                                  setSelectedApplicationId(null);
                                }}
                                disabled={!checklist.isComplete}
                                className={`rounded-xl px-5 py-3 text-sm font-semibold !text-white ${
                                  checklist.isComplete ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 cursor-not-allowed"
                                }`}
                                title={checklist.isComplete ? "Approve vendor application" : "Complete the checklist first"}
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
                    <h2 className="font-bold text-slate-900 text-lg">Vendor Approvals (demo)</h2>
                    <p className="text-sm text-slate-400">{pendingApprovals} pending · {approvedVendors} approved</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">{pendingApprovals} pending review</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        {["Owner", "Business", "Type", "Status", "Actions"].map(h => (
                          <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map(v => (
                        <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-3 font-medium text-slate-900">{v.name}</td>
                          <td className="py-3 text-slate-500">{v.business}</td>
                          <td className="py-3 text-slate-600">{v.type}</td>
                          <td className="py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              v.status === "approved" ? "bg-green-50 text-green-700" :
                              v.status === "rejected" ? "bg-red-50 text-red-700" :
                              "bg-yellow-50 text-yellow-700"
                            }`}>{v.status}</span>
                          </td>
                          <td className="py-3">
                            {v.status === "pending" ? (
                              <div className="flex gap-2">
                                <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "approved" } : x))} className="bg-green-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600">Approve</button>
                                <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "rejected" } : x))} className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Reject</button>
                              </div>
                            ) : <span className="text-xs text-slate-400">Completed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {tab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: "Orders This Month", value: "40", detail: "+12% from last month", icon: "📦" },
                  { title: "Revenue", value: "580,000 RWF", detail: "+8% from last month", icon: "💰" },
                  { title: "Bookings", value: "18", detail: "+5% from last month", icon: "📅" },
                  { title: "Complaints", value: "2", detail: "1 resolved, 1 pending", icon: "💬" },
                ].map(item => (
                  <div key={item.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">This month</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Platform Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Total Revenue", value: "2,450,000 RWF", icon: "💰" },
                    { label: "Total Bookings", value: "86", icon: "📅" },
                    { label: "Active Vendors", value: approvedVendors.toString(), icon: "🏪" },
                    { label: "Registered Users", value: mockUsers.length.toString(), icon: "👥" },
                    { label: "Avg Order Value", value: "14,500 RWF", icon: "🛒" },
                    { label: "Satisfaction Rate", value: "94%", icon: "⭐" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 border border-slate-100 rounded-xl p-4">
                      <span className="text-2xl">{item.icon}</span>
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
