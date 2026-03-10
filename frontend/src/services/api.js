import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Balance
export const getBalance = () => api.get("/balance").then((r) => r.data);
export const updateBalance = (amount) =>
  api.put("/balance", { amount }).then((r) => r.data);

// Income
export const getIncome = () => api.get("/income").then((r) => r.data);
export const createIncome = (data) =>
  api.post("/income", data).then((r) => r.data);
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// Expenses
export const getExpenses = () => api.get("/expenses").then((r) => r.data);
export const createExpense = (data) =>
  api.post("/expenses", data).then((r) => r.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Budgets
export const getBudgets = (month) =>
  api.get(`/budgets?month=${month}`).then((r) => r.data);
export const upsertBudget = (data) =>
  api.put("/budgets", data).then((r) => r.data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

// Reports
export const getMonthlyReport = (month) =>
  api.get(`/reports/monthly?month=${month}`).then((r) => r.data);
export const getQuarterlyReport = (quarter) =>
  api.get(`/reports/quarterly?quarter=${quarter}`).then((r) => r.data);

// Dashboard
export const getSummary = () =>
  api.get("/dashboard/summary").then((r) => r.data);
export const getMonthly = (month) =>
  api.get(`/dashboard/monthly?month=${month}`).then((r) => r.data);
export const getPie = () => api.get("/dashboard/pie").then((r) => r.data);
export const getLast6Months = () =>
  api.get("/dashboard/last6months").then((r) => r.data);
