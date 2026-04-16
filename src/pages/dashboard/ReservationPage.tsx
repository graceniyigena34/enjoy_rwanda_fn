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
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dashboard &gt; Reservation</p>
          <h2 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Table Reservation Setup</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Configure table sizes and prices. Customers will see these when booking.</p>
        </div>
        <button type="button" onClick={() => void loadConfigs()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1a1a2e] dark:border-white/10 dark:text-slate-200">
          &#8635; Refresh
        </button>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.6fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Table Configurations</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Each row is one table size. Edit or delete individual rows.</p>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-widest text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Table of People</th>
                    <th className="px-5 py-3">Price (RWF)</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">No configurations yet. Add one below.</td>
                    </tr>
                  ) : (
                    configs.map((config, index) => (
                      <tr key={config.id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{index + 1}</td>
                        <td className="px-5 py-3">
                          {editingId === config.id ? (
                            <input type="text" value={editForm.table_of_people} onChange={(e) => setEditForm((f) => ({ ...f, table_of_people: e.target.value }))} className="w-28 rounded-xl border border-[#1a1a2e] bg-white px-3 py-2 text-sm font-semibold outline-none dark:bg-white/5" />
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{config.table_of_people}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {editingId === config.id ? (
                            <input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className="w-36 rounded-xl border border-[#1a1a2e] bg-white px-3 py-2 text-sm font-semibold outline-none dark:bg-white/5" />
                          ) : (
                            <span className="text-slate-700 dark:text-slate-300">{Number(config.price).toLocaleString()} RWF</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {editingId === config.id ? (
                              <>
                                <button type="button" disabled={saving} onClick={() => void handleEditSave(config.id)} className="rounded-full bg-[#1a1a2e] px-3 py-1 text-xs font-semibold text-white hover:opacity-80 transition disabled:opacity-50">
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 transition dark:border-white/10 dark:text-slate-300">
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => { setEditingId(config.id); setEditForm({ table_of_people: config.table_of_people, price: String(config.price) }); }} className="rounded-full border border-[#1a1a2e] px-3 py-1 text-xs font-semibold text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition">
                                  Edit
                                </button>
                                <button type="button" disabled={deletingId === config.id} onClick={() => void handleDelete(config.id)} className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50">
                                  {deletingId === config.id ? "Deleting..." : "Delete"}
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

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Table of People</label>
              <input type="text" placeholder="e.g. 2-4" value={newPeople} onChange={(e) => setNewPeople(e.target.value)} className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Price (RWF)</label>
              <input type="number" min={0} placeholder="e.g. 2000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#1a1a2e] dark:border-white/10 dark:bg-white/5" />
            </div>
            <button type="button" disabled={saving} onClick={() => void handleAddRow()} className="rounded-full bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-50">
              {saving ? "Saving..." : "+ Add & Save"}
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Live Preview</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">How customers see your tables.</p>
          {configs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No tables configured yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {configs.map((config) => (
                <div key={config.id} className="flex flex-col items-center gap-1 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-center dark:border-white/10 dark:bg-white/5">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Table of</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{config.table_of_people}</span>
                  <span className="text-sm font-bold text-[#1a1a2e]">{Number(config.price).toLocaleString()} RWF</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
