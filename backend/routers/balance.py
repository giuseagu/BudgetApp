from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get("", response_model=schemas.BalanceRead)
def get_balance(db: Session = Depends(get_db)):
    balance = db.query(models.InitialBalance).first()
    if not balance:
        balance = models.InitialBalance(amount=0.0)
        db.add(balance)
        db.commit()
        db.refresh(balance)
    return balance


@router.put("", response_model=schemas.BalanceRead)
def update_balance(data: schemas.BalanceUpdate, db: Session = Depends(get_db)):
    balance = db.query(models.InitialBalance).first()
    if not balance:
        balance = models.InitialBalance(amount=data.amount)
        db.add(balance)
    else:
        balance.amount = data.amount
    db.commit()
    db.refresh(balance)
    return balance
