from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import balance, income, expenses, dashboard, budgets, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BudgetApp API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(balance.router)
app.include_router(income.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(budgets.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "BudgetApp API is running"}
