import { useEffect, useState, useCallback } from "react";
import { getBudgets, upsertBudget } from "../services/api";
import { getMonthly } from "../services/api";
import BudgetProgressBar from "../components/BudgetProgressBar";
import { CATEGORIES } from "../constants/categories";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetSettings() {
  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState([]);
  const [actuals, setActuals] = useState({});
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  const load = useCallback(async () => {
    const [b, m] = await Promise.all([getBudgets(month), getMonthly(month)]);
    setBudgets(b);
    setActuals(m.expense_by_category || {});
    const init = {};
    b.forEach((r) => { init[r.category] = r.amount != null ? String(r.amount) : ""; });
    setInputs(init);
    setSaved({});
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (category) => {
    const val = parseFloat(inputs[category]);
    if (isNaN(val) || val < 0) return;
    setSaving((s) => ({ ...s, [category]: true }));
    try {
      await upsertBudget({ month, category, amount: val });
      setSaved((s) => ({ ...s, [category]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [category]: false })), 2000);
      await load();
    } finally {
      setSaving((s) => ({ ...s, [category]: false }));
    }
  };

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Budget per categoria</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
        />
      </div>

      <p className="text-gray-400 text-sm">
        Imposta il budget mensile per ogni categoria. La barra mostra quanto hai speso rispetto al budget.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const actual = actuals[cat] ?? 0;
          const budget = budgetMap[cat];

          return (
            <div key={cat} className="bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-200 font-medium capitalize">{cat}</span>
                <span className="text-gray-400 text-sm">
                  Speso: €{actual.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <BudgetProgressBar actual={actual} budget={budget} />

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Budget €"
                  value={inputs[cat] ?? ""}
                  onChange={(e) =>
                    setInputs((i) => ({ ...i, [cat]: e.target.value }))
                  }
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => handleSave(cat)}
                  disabled={saving[cat]}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50 min-w-[70px]"
                >
                  {saved[cat] ? "Salvato ✓" : saving[cat] ? "..." : "Salva"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
