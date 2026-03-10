from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/income", tags=["income"])


@router.get("", response_model=List[schemas.IncomeRead])
def list_income(db: Session = Depends(get_db)):
    return db.query(models.Income).order_by(models.Income.created_at.desc()).all()


@router.post("", response_model=schemas.IncomeRead, status_code=201)
def create_income(data: schemas.IncomeCreate, db: Session = Depends(get_db)):
    income = models.Income(**data.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=204)
def delete_income(income_id: int, db: Session = Depends(get_db)):
    income = db.query(models.Income).filter(models.Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
