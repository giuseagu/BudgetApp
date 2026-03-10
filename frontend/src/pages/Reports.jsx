import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { getMonthlyReport, getQuarterlyReport } from "../services/api";
import BalanceCard from "../components/BalanceCard";
import BudgetProgressBar from "../components/BudgetProgressBar";

const PIE_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7","#14b8a6"];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentQuarter() {
  const d = new Date();
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${q}`;
}

function SectionTitle({ children }) {
  return <h2 className="text-gray-200 font-semibold text-lg mt-2">{children}</h2>;
}

export default function Reports() {
  const [tab, setTab] = useState("monthly");
  const [month, setMonth] = useState(currentMonth());
  const [quarter, setQuarter] = useState(currentQuarter());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReport(null);
    setLoading(true);
    const fn = tab === "monthly" ? getMonthlyReport(month) : getQuarterlyReport(quarter);
    fn.then(setReport).finally(() => setLoading(false));
  }, [tab, month, quarter]);

  const switchTab = (id) => {
    setReport(null);  // azzera subito per evitare render con dati sbagliati
    setTab(id);
  };

  const tabBtn = (id, label) => (
    <button
      onClick={() => switchTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        tab === id ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-100">Report</h1>
        <div className="flex gap-2">
          {tabBtn("monthly", "Mensile")}
          {tabBtn("quarterly", "Trimestrale")}
        </div>
        {tab === "monthly" ? (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
          />
        ) : (
          <QuarterPicker value={quarter} onChange={setQuarter} />
        )}
      </div>

      {loading && <p className="text-gray-400">Caricamento...</p>}

      {report && tab === "monthly" && report.income_by_type && <MonthlyView report={report} />}
      {report && tab === "quarterly" && report.monthly_breakdown && <QuarterlyView report={report} />}
    </div>
  );
}

function MonthlyView({ report }) {
  const pieData = report.expense_by_category.filter((c) => c.actual > 0);

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
        {report.period_label}
      </p>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard title="Entrate" amount={report.total_income} color="green" />
        <BalanceCard title="Uscite" amount={report.total_expense} color="red" />
        <BalanceCard title="Saldo" amount={report.balance} color={report.balance >= 0 ? "indigo" : "red"} />
        <div className="bg-gray-700 rounded-xl p-5 text-white shadow-md">
          <p className="text-sm opacity-80">Tasso risparmio</p>
          <p className="text-3xl font-bold mt-1">
            {report.savings_rate != null ? `${report.savings_rate}%` : "—"}
          </p>
        </div>
      </div>

      {/* Entrate per tipo */}
      <div className="bg-gray-800 rounded-xl p-5">
        <SectionTitle>Entrate per tipo</SectionTitle>
        <div className="flex gap-6 mt-3">
          {Object.entries(report.income_by_type).map(([type, amt]) => (
            amt > 0 && (
              <div key={type}>
                <p className="text-gray-400 text-sm capitalize">{type === "salary" ? "Stipendio" : "Extra"}</p>
                <p className="text-green-400 font-semibold text-lg">
                  €{amt.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabella spese per categoria */}
        <div className="bg-gray-800 rounded-xl p-5">
          <SectionTitle>Spese per categoria</SectionTitle>
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-gray-400 text-xs uppercase">
                <th className="text-left pb-2">Categoria</th>
                <th className="text-right pb-2">Speso</th>
                <th className="text-right pb-2">Budget</th>
                <th className="text-right pb-2">Δ</th>
              </tr>
            </thead>
            <tbody>
              {report.expense_by_category.map((c) => (
                <tr key={c.category} className="border-t border-gray-700">
                  <td className="py-2 text-gray-300 capitalize">{c.category}</td>
                  <td className="py-2 text-right text-red-400">
                    €{c.actual.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 text-right text-gray-400">
                    {c.budget != null
                      ? `€${c.budget.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td className={`py-2 text-right text-xs font-medium ${
                    c.delta == null ? "text-gray-500"
                    : c.over_budget ? "text-red-400"
                    : "text-green-400"
                  }`}>
                    {c.delta != null
                      ? `${c.delta > 0 ? "+" : ""}€${c.delta.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Progress bars */}
          <div className="mt-4 space-y-3">
            {report.expense_by_category.filter(c => c.budget != null).map((c) => (
              <div key={c.category}>
                <p className="text-gray-400 text-xs capitalize mb-1">{c.category}</p>
                <BudgetProgressBar actual={c.actual} budget={c.budget} />
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-gray-800 rounded-xl p-5">
          <SectionTitle>Distribuzione spese</SectionTitle>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-sm mt-8 text-center">Nessuna spesa</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="actual" nameKey="category"
                  cx="50%" cy="50%" outerRadius={90}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
                  formatter={(v) => [`€${v.toLocaleString("it-IT")}`, "Speso"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function QuarterlyView({ report }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
        {report.period_label}
      </p>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard title="Entrate totali" amount={report.total_income} color="green" />
        <BalanceCard title="Uscite totali" amount={report.total_expense} color="red" />
        <BalanceCard title="Saldo" amount={report.balance} color={report.balance >= 0 ? "indigo" : "red"} />
        <div className="bg-gray-700 rounded-xl p-5 text-white shadow-md">
          <p className="text-sm opacity-80">Tasso risparmio</p>
          <p className="text-3xl font-bold mt-1">
            {report.savings_rate != null ? `${report.savings_rate}%` : "—"}
          </p>
        </div>
      </div>

      {/* Bar chart mese per mese */}
      <div className="bg-gray-800 rounded-xl p-5">
        <SectionTitle>Andamento mensile</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={report.monthly_breakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="month_label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Legend wrapperStyle={{ color: "#9ca3af" }} />
            <Bar dataKey="total_income" name="Entrate" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_expense" name="Uscite" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabella spese per categoria */}
      <div className="bg-gray-800 rounded-xl p-5">
        <SectionTitle>Spese per categoria — riepilogo trimestrale</SectionTitle>
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="text-left pb-2">Categoria</th>
              <th className="text-right pb-2">Totale</th>
              <th className="text-right pb-2">Media/mese</th>
              <th className="text-right pb-2">Budget/mese</th>
              <th className="text-right pb-2">Δ totale</th>
            </tr>
          </thead>
          <tbody>
            {report.expense_by_category.map((c) => (
              <tr key={c.category} className="border-t border-gray-700">
                <td className="py-2 text-gray-300 capitalize">{c.category}</td>
                <td className="py-2 text-right text-red-400">
                  €{c.total_actual.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right text-gray-300">
                  €{c.monthly_avg.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right text-gray-400">
                  {c.budget_monthly != null
                    ? `€${c.budget_monthly.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
                <td className={`py-2 text-right text-xs font-medium ${
                  c.total_delta == null ? "text-gray-500"
                  : c.over_budget ? "text-red-400"
                  : "text-green-400"
                }`}>
                  {c.total_delta != null
                    ? `${c.total_delta > 0 ? "+" : ""}€${c.total_delta.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuarterPicker({ value, onChange }) {
  const parts = value.split("-Q");
  const year = parseInt(parts[0]);
  const q = parseInt(parts[1]);

  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        value={year}
        onChange={(e) => onChange(`${e.target.value}-Q${q}`)}
        className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm w-24"
        min="2000"
        max="2100"
      />
      <select
        value={q}
        onChange={(e) => onChange(`${year}-Q${e.target.value}`)}
        className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
      >
        <option value="1">Q1 (Gen-Mar)</option>
        <option value="2">Q2 (Apr-Giu)</option>
        <option value="3">Q3 (Lug-Set)</option>
        <option value="4">Q4 (Ott-Dic)</option>
      </select>
    </div>
  );
}
