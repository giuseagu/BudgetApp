from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=List[schemas.ExpenseRead])
def list_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).order_by(models.Expense.created_at.desc()).all()


@router.post("", response_model=schemas.ExpenseRead, status_code=201)
def create_expense(data: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    expense = models.Expense(**data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
