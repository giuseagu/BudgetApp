export default function BudgetProgressBar({ actual, budget }) {
  if (budget == null) {
    return <span className="text-gray-500 text-xs">Nessun budget impostato</span>;
  }

  const pct = Math.min((actual / budget) * 100, 100);
  const over = actual > budget;
  const warn = pct >= 80 && !over;

  const barColor = over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-green-500";
  const textColor = over ? "text-red-400" : warn ? "text-yellow-400" : "text-green-400";

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className={textColor}>
          €{actual.toLocaleString("it-IT", { minimumFractionDigits: 2 })} /{" "}
          €{budget.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </span>
        <span className={textColor}>{((actual / budget) * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
