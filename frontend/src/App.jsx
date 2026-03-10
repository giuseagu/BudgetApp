import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/Income";
import ExpensesPage from "./pages/Expenses";
import Monthly from "./pages/Monthly";
import BudgetSettings from "./pages/BudgetSettings";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/budget" element={<BudgetSettings />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
