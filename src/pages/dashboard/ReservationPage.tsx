import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  getMyTableConfigurations,
  saveTableConfigurations,
  updateTableConfiguration,
  deleteTableConfiguration,
  type TableConfigRecord,
} from "../../utils/api";

export default function ReservationPage() {
  const { token } = useApp();

  const [configs, setConfigs] = useState<TableConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ table_of_people: string; price: string }>({ table_of_people: "", price: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPeople, setNewPeople] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadConfigs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyTableConfigurations(token);
      setConfigs(data);
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadConfigs(); }, [token]);

  const handleAddRow = async () => {
    if (!newPeople.trim() || !newPrice.trim()) {
      showMsg("error", "Please fill in both fields.");
      return;
    }
    if (!token) return;
    setSaving(true);
    try {
      const updated = [
        ...configs.map(({ table_of_people, price }) => ({ table_of_people, price })),
        { table_of_people: newPeople.trim(), price: Number(newPrice) },
      ];
      const saved = await saveTableConfigurations(token, updated);
      setConfigs(saved);
      setNewPeople("");
      setNewPrice("");
      showMsg("success", "Table added.");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (id: number) => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateTableConfiguration(token, id, {
        table_of_people: editForm.table_of_people,
        price: Number(editForm.price),
      });
      setConfigs((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      showMsg("success", "Table updated.");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteTableConfiguration(token, id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      showMsg("success", "Table deleted.");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-shell space-y-8 pb-16">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tableRowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.1); }
          50% { box-shadow: 0 0 0 8px rgba(251, 146, 60, 0); }
        }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
        .table-row-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .table-row-hover:hover { transform: translateX(4px); }
      `}</style>

      <div className="animate-slideDown space-y-3">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 dark:bg-orange-900/30">
              <span className="text-lg">🍽️</span>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">Reservation System</p>
            </div>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 dark:text-white">Table Setup</h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">Define your table configurations and pricing. Customers will instantly see these options when making a dining reservation.</p>
          </div>
          <button type="button" onClick={() => void loadConfigs()} className="group inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-lg shadow-slate-200/20 transition-all hover:border-orange-400 hover:shadow-orange-300/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-orange-500 dark:hover:shadow-orange-500/20">
            <span className="transition group-hover:rotate-180 inline-block">↻</span> Refresh
          </button>
        </div>
      </div>

      {msg && (
        <div className={`animate-slideDown rounded-2xl px-5 py-4 text-sm font-bold border-2 backdrop-blur-xl flex items-center gap-3 ${msg.type === "success" ? "bg-emerald-50/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800" : "bg-red-50/80 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"}`}>
          <span className="text-lg">{msg.type === "success" ? "✓" : "⚠"}</span>
          {msg.text}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.5fr_0.5fr] animate-fadeInUp">
        <div className="rounded-3xl border-2 border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-white/80 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur-2xl transition-all hover:shadow-2xl hover:shadow-orange-300/20 dark:border-white/10 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/40 dark:shadow-slate-900/60">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h3 className="text-3xl font-black text-slate-950 dark:text-white">All Tables</h3>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">Create and manage your restaurant's table offerings</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 text-2xl">🍽️</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 animate-pulse shadow-lg"></div>
              </div>
              <p className="mt-6 text-base font-bold text-slate-600 dark:text-slate-400">Fetching your tables...</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">This will just take a moment</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200/50 dark:border-white/5 shadow-inner shadow-slate-200/20">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gradient-to-r from-slate-100 via-slate-50 to-white dark:from-white/8 dark:via-white/5 dark:to-transparent border-b-2 border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Configuration</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Price</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-white/5">
                  {configs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center">
                        <div className="space-y-4">
                          <div className="text-5xl">🏨</div>
                          <div>
                            <p className="text-lg font-black text-slate-700 dark:text-slate-300">No tables configured</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Start by adding your first table configuration below</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    configs.map((config, index) => (
                      <tr key={config.id} className="table-row-hover group/row bg-gradient-to-r from-white/50 via-white/30 to-transparent transition-all hover:from-orange-50/50 hover:via-orange-50/30 dark:from-white/3 dark:via-white/2 dark:to-transparent dark:hover:from-orange-500/10 dark:hover:via-orange-500/5">
                        <td className="px-6 py-5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-black text-slate-700 dark:from-white/10 dark:to-white/5 dark:text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {editingId === config.id ? (
                            <input type="text" value={editForm.table_of_people} onChange={(e) => setEditForm((f) => ({ ...f, table_of_people: e.target.value }))} className="rounded-xl border-2 border-orange-400 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:ring-2 focus:ring-orange-400/30 dark:bg-white/10 dark:border-orange-500 dark:text-white" placeholder="e.g. 2-4" autoFocus />
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10">
                              <span className="text-lg">👥</span>
                              <span className="font-bold text-slate-900 dark:text-white">{config.table_of_people}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {editingId === config.id ? (
                            <div className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 border-2 border-orange-400 dark:bg-white/10 dark:border-orange-500">
                              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">RWF</span>
                              <input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className="w-32 bg-transparent text-sm font-bold text-slate-900 outline-none dark:text-white" placeholder="0" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 font-black text-slate-900 dark:text-white">
                              <span className="text-xs text-slate-500 dark:text-slate-400">RWF</span>
                              <span className="text-base">{Number(config.price).toLocaleString()}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {editingId === config.id ? (
                              <>
                                <button type="button" disabled={saving} onClick={() => void handleEditSave(config.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:opacity-50">
                                  ✓ Save
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border-2 border-slate-300 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                                  ✕ Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => { setEditingId(config.id); setEditForm({ table_of_people: config.table_of_people, price: String(config.price) }); }} className="rounded-lg border-2 border-[#1a1a2e] bg-white px-4 py-2 text-xs font-bold text-[#1a1a2e] shadow-sm transition hover:bg-[#1a1a2e] hover:text-white dark:bg-white/5 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20 dark:hover:border-orange-600">
                                  ✎ Edit
                                </button>
                                <button type="button" disabled={deletingId === config.id} onClick={() => void handleDelete(config.id)} className="rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/30">
                                  {deletingId === config.id ? "⏳" : "✕"} Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 space-y-6 border-t-2 border-slate-200/50 pt-8 dark:border-white/5">
            <div>
              <h4 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-black text-white">+</span>
                Add New Table
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create a new table configuration for your restaurant</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3">👥 Table Configuration</label>
                <input type="text" placeholder="e.g. 2-4 persons, Party of 6" value={newPeople} onChange={(e) => setNewPeople(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3">💰 Price (RWF)</label>
                <input type="number" min={0} placeholder="e.g. 5000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-orange-500" />
              </div>
            </div>
            <button type="button" disabled={saving} onClick={() => void handleAddRow()} className="w-full rounded-xl bg-gradient-to-r from-[#1a1a2e] to-slate-900 px-6 py-4 text-base font-black text-white shadow-xl shadow-slate-900/40 transition hover:shadow-2xl hover:shadow-slate-900/50 disabled:opacity-50 dark:from-orange-500 dark:to-orange-600 dark:shadow-orange-600/40 dark:hover:shadow-orange-600/60">
              {saving ? "⏳ Saving..." : "✓ Add & Save Table"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-white/80 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur-2xl transition-all hover:shadow-2xl hover:shadow-orange-300/20 dark:border-white/10 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/40 dark:shadow-slate-900/60">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h3 className="text-3xl font-black text-slate-950 dark:text-white">Live Preview</h3>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">How customers see your tables when booking</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 text-2xl">👁️</div>
          </div>
          {configs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="text-6xl mb-4 opacity-50">🎫</div>
              <p className="text-xl font-black text-slate-700 dark:text-slate-300">No tables yet</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Add your first table above to see a live preview</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {configs.map((config, idx) => (
                <div key={config.id} className="group/card relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-lg transition-all hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 dark:border-white/10 dark:from-white/8 dark:to-white/5 dark:hover:border-orange-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-transparent opacity-0 transition-opacity group-hover/card:opacity-100"></div>
                  <div className="relative space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-lg dark:from-orange-900/30 dark:to-orange-800/30">
                      {["👤", "👥", "👨‍👩‍👧", "👨‍👩‍👧‍👦"][idx % 4]}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">People</p>
                      <p className="text-3xl font-black text-[#1a1a2e] dark:text-orange-400 mt-1">{config.table_of_people}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1 bg-slate-100/50 rounded-lg py-2 dark:bg-white/5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">RWF</span>
                      <p className="font-black text-slate-900 dark:text-white">{Number(config.price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
