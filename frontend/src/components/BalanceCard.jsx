export default function BalanceCard({ title, amount, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-600",
    green: "bg-green-600",
    red: "bg-red-600",
    blue: "bg-blue-600",
  };

  return (
    <div className={`${colorMap[color]} rounded-xl p-5 text-white shadow-md`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">
        €{typeof amount === "number" ? amount.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "—"}
      </p>
    </div>
  );
}
