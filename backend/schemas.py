from pydantic import BaseModel
from typing import Optional
from datetime import date as Date, datetime


# --- Balance ---
class BalanceUpdate(BaseModel):
    amount: float


class BalanceRead(BaseModel):
    id: int
    amount: float
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# --- Income ---
class IncomeCreate(BaseModel):
    description: str
    amount: float
    type: str                           # salary | extra
    is_recurring: bool
    frequency: Optional[str] = None    # monthly | annual
    start_date: Optional[Date] = None  # recurring: data inizio
    end_date: Optional[Date] = None    # recurring: data fine (opzionale)
    date: Optional[Date] = None        # occasionale: data entrata


class IncomeRead(IncomeCreate):
    id: int
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# --- Expense ---
class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str
    is_recurring: bool
    frequency: Optional[str] = None    # monthly | annual
    start_date: Optional[Date] = None  # recurring: data inizio
    end_date: Optional[Date] = None    # recurring: data fine (opzionale)
    date: Optional[Date] = None        # occasionale: data spesa


class ExpenseRead(ExpenseCreate):
    id: int
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# --- Category Budget ---
class BudgetUpsert(BaseModel):
    month: str        # YYYY-MM
    category: str
    amount: float


class BudgetRead(BaseModel):
    id: Optional[int] = None
    month: str
    category: str
    amount: Optional[float] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --- Reports ---
class CategoryActual(BaseModel):
    category: str
    actual: float
    budget: Optional[float] = None
    delta: Optional[float] = None        # actual - budget (positivo = sforamento)
    percentage: Optional[float] = None   # actual / budget * 100
    over_budget: bool


class MonthlyReport(BaseModel):
    period: str
    period_label: str
    total_income: float
    total_expense: float
    balance: float
    savings_rate: Optional[float] = None
    income_by_type: dict
    expense_by_category: list[CategoryActual]


class MonthBreakdown(BaseModel):
    month: str
    month_label: str
    total_income: float
    total_expense: float
    balance: float


class CategoryQuarterly(BaseModel):
    category: str
    total_actual: float
    monthly_avg: float
    budget_monthly: Optional[float] = None
    total_delta: Optional[float] = None
    over_budget: bool


class QuarterlyReport(BaseModel):
    period: str
    period_label: str
    months: list[str]
    total_income: float
    total_expense: float
    balance: float
    savings_rate: Optional[float] = None
    monthly_breakdown: list[MonthBreakdown]
    expense_by_category: list[CategoryQuarterly]
