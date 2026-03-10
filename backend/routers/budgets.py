from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from utils import CATEGORIES
import models
import schemas

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=List[schemas.BudgetRead])
def get_budgets(month: str = Query(..., description="YYYY-MM"), db: Session = Depends(get_db)):
    """Restituisce il budget per ogni categoria del mese. Le categorie senza budget hanno amount=null."""
    rows = db.query(models.CategoryBudget).filter(models.CategoryBudget.month == month).all()
    budget_map = {r.category: r for r in rows}

    result = []
    for cat in CATEGORIES:
        row = budget_map.get(cat)
        if row:
            result.append(schemas.BudgetRead(
                id=row.id,
                month=row.month,
                category=cat,
                amount=row.amount,
                updated_at=row.updated_at,
            ))
        else:
            result.append(schemas.BudgetRead(month=month, category=cat))
    return result


@router.put("", response_model=schemas.BudgetRead)
def upsert_budget(data: schemas.BudgetUpsert, db: Session = Depends(get_db)):
    """Crea o aggiorna il budget mensile per una categoria."""
    row = db.query(models.CategoryBudget).filter(
        models.CategoryBudget.month == data.month,
        models.CategoryBudget.category == data.category,
    ).first()

    if row:
        row.amount = data.amount
    else:
        row = models.CategoryBudget(month=data.month, category=data.category, amount=data.amount)
        db.add(row)

    db.commit()
    db.refresh(row)
    return schemas.BudgetRead(
        id=row.id, month=row.month, category=row.category,
        amount=row.amount, updated_at=row.updated_at,
    )


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    row = db.query(models.CategoryBudget).filter(models.CategoryBudget.id == budget_id).first()
    if row:
        db.delete(row)
        db.commit()
