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
import { getMonthly } from "../services/api";
import BalanceCard from "../components/BalanceCard";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Monthly() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);

  const load = async (m) => {
    setData(await getMonthly(m));
  };

  useEffect(() => {
    load(month);
  }, [month]);

  const pieData = data
    ? Object.entries(data.expense_by_category).map(([category, amount]) => ({
        category,
        amount,
      }))
    : [];

  const barData = data
    ? [{ label: data.month, income: data.total_income, expense: data.total_expense }]
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Vista Mensile</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
        />
      </div>

      {data && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BalanceCard title="Entrate del mese" amount={data.total_income} color="green" />
            <BalanceCard title="Uscite del mese" amount={data.total_expense} color="red" />
            <BalanceCard
              title="Saldo del mese"
              amount={data.balance}
              color={data.balance >= 0 ? "indigo" : "red"}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-gray-200 font-semibold mb-4">Entrate vs Uscite</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
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

            <div className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-gray-200 font-semibold mb-4">Spese per categoria</h2>
              {pieData.length === 0 ? (
                <p className="text-gray-500 text-sm mt-10 text-center">Nessuna spesa questo mese</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ category, percent }) =>
                        `${category} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
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
        </>
      )}
    </div>
  );
}
