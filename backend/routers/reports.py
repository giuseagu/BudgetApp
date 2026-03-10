from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from utils import monthly_amount, CATEGORIES, MONTH_LABELS
from collections import defaultdict
import models
import schemas
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])


def _compute_month(incomes, expenses, budgets_map, year: int, month: int) -> dict:
    """Calcola i dati dettagliati di un singolo mese."""
    total_income = 0.0
    income_by_type = {"salary": 0.0, "extra": 0.0}

    for inc in incomes:
        amt = monthly_amount(inc, year, month)
        total_income += amt
        income_by_type[inc.type] = income_by_type.get(inc.type, 0.0) + amt

    category_actual: dict[str, float] = defaultdict(float)
    for exp in expenses:
        amt = monthly_amount(exp, year, month)
        if amt > 0:
            category_actual[exp.category] += amt

    total_expense = sum(category_actual.values())
    balance = total_income - total_expense
    savings_rate = round(balance / total_income * 100, 2) if total_income > 0 else None

    expense_by_category = []
    for cat in CATEGORIES:
        actual = round(category_actual.get(cat, 0.0), 2)
        budget = budgets_map.get(cat)
        if actual == 0.0 and budget is None:
            continue
        delta = round(actual - budget, 2) if budget is not None else None
        percentage = round(actual / budget * 100, 2) if budget else None
        expense_by_category.append(schemas.CategoryActual(
            category=cat,
            actual=actual,
            budget=budget,
            delta=delta,
            percentage=percentage,
            over_budget=(delta > 0) if delta is not None else False,
        ))

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "balance": round(balance, 2),
        "savings_rate": savings_rate,
        "income_by_type": {k: round(v, 2) for k, v in income_by_type.items()},
        "expense_by_category": expense_by_category,
    }


@router.get("/monthly", response_model=schemas.MonthlyReport)
def get_monthly_report(
    month: str = Query(..., description="YYYY-MM"),
    db: Session = Depends(get_db),
):
    try:
        year, mon = map(int, month.split("-"))
    except ValueError:
        return {}

    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()

    budget_rows = db.query(models.CategoryBudget).filter(
        models.CategoryBudget.month == month
    ).all()
    budgets_map = {r.category: r.amount for r in budget_rows}

    data = _compute_month(incomes, expenses, budgets_map, year, mon)

    return schemas.MonthlyReport(
        period=month,
        period_label=f"{MONTH_LABELS[mon]} {year}",
        **data,
    )


@router.get("/quarterly", response_model=schemas.QuarterlyReport)
def get_quarterly_report(
    quarter: str = Query(..., description="YYYY-QN, es. 2026-Q1"),
    db: Session = Depends(get_db),
):
    try:
        year_str, q_str = quarter.split("-Q")
        year = int(year_str)
        q = int(q_str)
        assert 1 <= q <= 4
    except Exception:
        return {}

    start_month = (q - 1) * 3 + 1
    months = [f"{year}-{(start_month + i):02d}" for i in range(3)]
    month_nums = [start_month + i for i in range(3)]

    q_labels = {1: "Gen - Mar", 2: "Apr - Giu", 3: "Lug - Set", 4: "Ott - Dic"}
    period_label = f"Q{q} {year} ({q_labels[q]})"

    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()

    # Usa i budget del mese centrale del trimestre
    mid_month = months[1]
    budget_rows = db.query(models.CategoryBudget).filter(
        models.CategoryBudget.month == mid_month
    ).all()
    budgets_map = {r.category: r.amount for r in budget_rows}

    monthly_breakdown = []
    cat_totals: dict[str, float] = defaultdict(float)
    total_income = 0.0
    total_expense = 0.0

    for i, mon in enumerate(month_nums):
        data = _compute_month(incomes, expenses, budgets_map, year, mon)
        monthly_breakdown.append(schemas.MonthBreakdown(
            month=months[i],
            month_label=MONTH_LABELS[mon],
            total_income=data["total_income"],
            total_expense=data["total_expense"],
            balance=data["balance"],
        ))
        total_income += data["total_income"]
        total_expense += data["total_expense"]
        for cat_data in data["expense_by_category"]:
            cat_totals[cat_data.category] += cat_data.actual

    balance = total_income - total_expense
    savings_rate = round(balance / total_income * 100, 2) if total_income > 0 else None

    expense_by_category = []
    for cat in CATEGORIES:
        total_actual = round(cat_totals.get(cat, 0.0), 2)
        if total_actual == 0.0 and cat not in budgets_map:
            continue
        monthly_avg = round(total_actual / 3, 2)
        budget_monthly = budgets_map.get(cat)
        total_delta = round(total_actual - budget_monthly * 3, 2) if budget_monthly else None
        expense_by_category.append(schemas.CategoryQuarterly(
            category=cat,
            total_actual=total_actual,
            monthly_avg=monthly_avg,
            budget_monthly=budget_monthly,
            total_delta=total_delta,
            over_budget=(total_delta > 0) if total_delta is not None else False,
        ))

    return schemas.QuarterlyReport(
        period=quarter,
        period_label=period_label,
        months=months,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        balance=round(balance, 2),
        savings_rate=savings_rate,
        monthly_breakdown=monthly_breakdown,
        expense_by_category=expense_by_category,
    )
