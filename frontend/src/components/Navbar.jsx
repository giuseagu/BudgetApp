import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
        <span className="text-white font-bold text-lg mr-6">BudgetApp</span>
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/income" className={linkClass}>
          Entrate
        </NavLink>
        <NavLink to="/expenses" className={linkClass}>
          Spese
        </NavLink>
        <NavLink to="/monthly" className={linkClass}>
          Vista Mensile
        </NavLink>
      </div>
    </nav>
  );
}
