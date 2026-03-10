import { useEffect, useState } from "react";
import { getExpenses, createExpense, deleteExpense } from "../services/api";

const CATEGORIES = ["affitto", "cibo", "trasporti", "salute", "svago", "abbonamenti", "altro"];

const defaultForm = {
  description: "",
  amount: "",
  category: "altro",
  is_recurring: true,
  frequency: "monthly",
  start_date: "",
  end_date: "",
  date: "",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setExpenses(await getExpenses());
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validazione JS esplicita
    if (form.is_recurring && !form.start_date) {
      setError("Inserisci una data di inizio per la spesa ricorrente.");
      return;
    }
    if (!form.is_recurring && !form.date) {
      setError("Inserisci la data della spesa.");
      return;
    }

    setLoading(true);
    try {
      const recurring = form.is_recurring;
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        is_recurring: recurring,
        frequency: recurring ? form.frequency : null,
        start_date: recurring ? form.start_date : null,
        end_date: recurring && form.end_date ? form.end_date : null,
        date: !recurring ? form.date : null,
      };
      await createExpense(payload);
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
    await deleteExpense(id);
    await load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-100">Spese</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-gray-200 font-semibold">Aggiungi spesa</h2>

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
              placeholder="Es. Affitto mensile"
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
            <label className="text-gray-400 text-sm">Categoria</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <input
              id="is_recurring_exp"
              name="is_recurring"
              type="checkbox"
              checked={form.is_recurring}
              onChange={handleChange}
              className="w-4 h-4 accent-indigo-500"
            />
            <label htmlFor="is_recurring_exp" className="text-gray-300 text-sm">
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
                  Data fine{" "}
                  <span className="text-gray-500">(opzionale)</span>
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

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Aggiungi"}
        </button>
      </form>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Descrizione</th>
              <th className="px-4 py-3 text-right">Importo</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Ricorrenza</th>
              <th className="px-4 py-3 text-left">Periodo / Data</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  Nessuna spesa registrata
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-200">{exp.description}</td>
                  <td className="px-4 py-3 text-right text-red-400 font-medium">
                    €{exp.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{exp.category}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {exp.is_recurring
                      ? exp.frequency === "monthly" ? "Mensile" : "Annuale"
                      : "Occasionale"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {exp.is_recurring
                      ? `${exp.start_date || "—"} → ${exp.end_date || "∞"}`
                      : exp.date || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
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
