import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getSummary, getLast6Months, getPie, updateBalance } from "../services/api";
import BalanceCard from "../components/BalanceCard";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [last6, setLast6] = useState([]);
  const [pie, setPie] = useState([]);
  const [editBalance, setEditBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  const load = async () => {
    const [s, l, p] = await Promise.all([getSummary(), getLast6Months(), getPie()]);
    setSummary(s);
    setLast6(l);
    setPie(p);
    setBalanceInput(s.initial_balance);
  };

  useEffect(() => {
    load();
  }, []);

  const handleBalanceSave = async () => {
    await updateBalance(parseFloat(balanceInput));
    setEditBalance(false);
    load();
  };

  if (!summary) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard title="Saldo Attuale" amount={summary.current_balance} color="indigo" />
        <BalanceCard title="Saldo Iniziale" amount={summary.initial_balance} color="blue" />
        <BalanceCard title="Entrate Totali" amount={summary.total_income} color="green" />
        <BalanceCard title="Uscite Totali" amount={summary.total_expense} color="red" />
      </div>

      {/* Edit initial balance */}
      <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
        <span className="text-gray-300 text-sm">Saldo iniziale:</span>
        {editBalance ? (
          <>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-1 w-36 text-sm"
            />
            <button
              onClick={handleBalanceSave}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
            >
              Salva
            </button>
            <button
              onClick={() => setEditBalance(false)}
              className="text-gray-400 text-sm hover:text-white"
            >
              Annulla
            </button>
          </>
        ) : (
          <>
            <span className="text-white font-semibold">
              €{summary.initial_balance.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => setEditBalance(true)}
              className="text-indigo-400 text-sm hover:text-indigo-300"
            >
              Modifica
            </button>
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart last 6 months */}
        <div className="bg-gray-800 rounded-xl p-5">
          <h2 className="text-gray-200 font-semibold mb-4">Ultimi 6 mesi</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={last6} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="income" name="Entrate" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Uscite" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart expenses by category */}
        <div className="bg-gray-800 rounded-xl p-5">
          <h2 className="text-gray-200 font-semibold mb-4">Spese per categoria</h2>
          {pie.length === 0 ? (
            <p className="text-gray-500 text-sm mt-10 text-center">Nessuna spesa registrata</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category, percent }) =>
                    `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {pie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
                  formatter={(value) => [`€${value.toLocaleString("it-IT")}`, "Importo"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
