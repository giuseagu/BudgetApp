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
