from sqlalchemy import Column, Integer, Float, String, Boolean, Date, DateTime, UniqueConstraint, func
from database import Base


class InitialBalance(Base):
    __tablename__ = "initial_balance"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)          # salary | extra
    is_recurring = Column(Boolean, nullable=False, default=False)
    frequency = Column(String, nullable=True)      # monthly | annual | null
    start_date = Column(Date, nullable=True)       # recurring: data inizio
    end_date = Column(Date, nullable=True)         # recurring: data fine (opzionale)
    date = Column(Date, nullable=True)             # occasionale: data dell'entrata
    created_at = Column(DateTime, server_default=func.now())


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)      # affitto, cibo, trasporti, altro
    is_recurring = Column(Boolean, nullable=False, default=False)
    frequency = Column(String, nullable=True)      # monthly | annual | null
    start_date = Column(Date, nullable=True)       # recurring: data inizio
    end_date = Column(Date, nullable=True)         # recurring: data fine (opzionale)
    date = Column(Date, nullable=True)             # occasionale: data della spesa
    created_at = Column(DateTime, server_default=func.now())


class CategoryBudget(Base):
    __tablename__ = "category_budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, nullable=False)       # formato YYYY-MM
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("month", "category", name="uq_budget_month_category"),)
