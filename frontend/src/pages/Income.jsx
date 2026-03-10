import { useEffect, useState } from "react";
import { getIncome, createIncome, updateIncome, deleteIncome } from "../services/api";

const defaultForm = {
  description: "",
  amount: "",
  type: "extra",
  is_recurring: false,
  frequency: "monthly",
  start_date: "",
  end_date: "",
  date: "",
};

function incomeToForm(inc) {
  return {
    description: inc.description,
    amount: String(inc.amount),
    type: inc.type,
    is_recurring: inc.is_recurring,
    frequency: inc.frequency || "monthly",
    start_date: inc.start_date || "",
    end_date: inc.end_date || "",
    date: inc.date || "",
  };
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null); // null = nuovo, number = modifica
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => setIncomes(await getIncome());

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (inc) => {
    setEditingId(inc.id);
    setForm(incomeToForm(inc));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(defaultForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.is_recurring && !form.start_date) {
      setError("Inserisci una data di inizio per l'entrata ricorrente.");
      return;
    }
    if (!form.is_recurring && !form.date) {
      setError("Inserisci la data dell'entrata.");
      return;
    }

    setLoading(true);
    try {
      const recurring = form.is_recurring;
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type,
        is_recurring: recurring,
        frequency: recurring ? form.frequency : null,
        start_date: recurring ? form.start_date : null,
        end_date: recurring && form.end_date ? form.end_date : null,
        date: !recurring ? form.date : null,
      };

      if (editingId !== null) {
        await updateIncome(editingId, payload);
      } else {
        await createIncome(payload);
      }

      setEditingId(null);
      setForm(defaultForm);
      await load();
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(msg ? JSON.stringify(msg) : "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (editingId === id) handleCancel();
    await deleteIncome(id);
    await load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-100">Entrate</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-gray-200 font-semibold">
          {editingId !== null ? "Modifica entrata" : "Aggiungi entrata"}
        </h2>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-300 rounded px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Descrizione</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              placeholder="Es. Bonus anno 2026"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Importo (€)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={handleChange}
              required
              className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="extra">Extra</option>
              <option value="salary">Stipendio</option>
            </select>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <input
              id="is_recurring"
              name="is_recurring"
              type="checkbox"
              checked={form.is_recurring}
              onChange={handleChange}
              className="w-4 h-4 accent-indigo-500"
            />
            <label htmlFor="is_recurring" className="text-gray-300 text-sm">
              Ricorrente
            </label>
          </div>

          {form.is_recurring ? (
            <>
              <div>
                <label className="text-gray-400 text-sm">Frequenza</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                >
                  <option value="monthly">Mensile</option>
                  <option value="annual">Annuale</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Data inizio</label>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">
                  Data fine <span className="text-gray-500">(opzionale)</span>
                </label>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-gray-400 text-sm">Data</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : editingId !== null ? "Salva modifiche" : "Aggiungi"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              Annulla
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Descrizione</th>
              <th className="px-4 py-3 text-right">Importo</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Ricorrenza</th>
              <th className="px-4 py-3 text-left">Periodo / Data</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  Nessuna entrata registrata
                </td>
              </tr>
            ) : (
              incomes.map((inc) => (
                <tr
                  key={inc.id}
                  className={`border-t border-gray-700 transition-colors ${
                    editingId === inc.id ? "bg-indigo-900/30" : "hover:bg-gray-700/30"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-200">{inc.description}</td>
                  <td className="px-4 py-3 text-right text-green-400 font-medium">
                    €{inc.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {inc.type === "salary" ? "Stipendio" : "Extra"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {inc.is_recurring
                      ? inc.frequency === "monthly" ? "Mensile" : "Annuale"
                      : "Occasionale"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {inc.is_recurring
                      ? `${inc.start_date || "—"} → ${inc.end_date || "∞"}`
                      : inc.date || "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(inc)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
