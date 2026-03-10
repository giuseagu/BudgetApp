from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from collections import defaultdict
import models
from datetime import date
from utils import monthly_amount, count_months

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    balance_row = db.query(models.InitialBalance).first()
    initial = balance_row.amount if balance_row else 0.0

    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()

    today = date.today()
    total_income = 0.0
    total_expense = 0.0

    for inc in incomes:
        if inc.is_recurring:
            start = inc.start_date or (inc.created_at.date() if inc.created_at else today)
            end = min(inc.end_date, today) if inc.end_date else today
            months = count_months(start, end)
            if inc.frequency == "monthly":
                total_income += inc.amount * months
            elif inc.frequency == "annual":
                total_income += (inc.amount / 12) * months
        else:
            total_income += inc.amount

    for exp in expenses:
        if exp.is_recurring:
            start = exp.start_date or (exp.created_at.date() if exp.created_at else today)
            end = min(exp.end_date, today) if exp.end_date else today
            months = count_months(start, end)
            if exp.frequency == "monthly":
                total_expense += exp.amount * months
            elif exp.frequency == "annual":
                total_expense += (exp.amount / 12) * months
        else:
            total_expense += exp.amount

    return {
        "initial_balance": initial,
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "current_balance": round(initial + total_income - total_expense, 2),
    }


@router.get("/monthly")
def get_monthly(month: str = Query(..., description="Format: YYYY-MM"), db: Session = Depends(get_db)):
    try:
        year, mon = map(int, month.split("-"))
    except ValueError:
        return {"error": "Invalid month format. Use YYYY-MM"}

    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()

    monthly_income = sum(monthly_amount(i, year, mon) for i in incomes)
    monthly_expense = sum(monthly_amount(e, year, mon) for e in expenses)

    category_map = defaultdict(float)
    for exp in expenses:
        amt = monthly_amount(exp, year, mon)
        if amt > 0:
            category_map[exp.category] += amt

    return {
        "month": month,
        "total_income": round(monthly_income, 2),
        "total_expense": round(monthly_expense, 2),
        "balance": round(monthly_income - monthly_expense, 2),
        "expense_by_category": {k: round(v, 2) for k, v in category_map.items()},
    }


@router.get("/pie")
def get_pie(db: Session = Depends(get_db)):
    """Total expense distribution by category (monthly equivalent for recurring)."""
    expenses = db.query(models.Expense).all()
    category_map = defaultdict(float)

    for exp in expenses:
        if exp.is_recurring:
            monthly = exp.amount if exp.frequency == "monthly" else exp.amount / 12
            category_map[exp.category] += monthly
        else:
            category_map[exp.category] += exp.amount

    return [{"category": k, "amount": round(v, 2)} for k, v in category_map.items()]


@router.get("/last6months")
def get_last6months(db: Session = Depends(get_db)):
    """Income vs expenses for the last 6 months."""
    today = date.today()
    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()
    result = []

    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1

        monthly_income = sum(monthly_amount(inc, year, month) for inc in incomes)
        monthly_expense = sum(monthly_amount(exp, year, month) for exp in expenses)

        result.append({
            "month": f"{year}-{month:02d}",
            "income": round(monthly_income, 2),
            "expense": round(monthly_expense, 2),
        })

    return result
