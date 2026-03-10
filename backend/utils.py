from datetime import date

CATEGORIES = ["affitto", "cibo", "trasporti", "salute", "svago", "abbonamenti", "altro"]

MONTH_LABELS = {
    1: "Gennaio", 2: "Febbraio", 3: "Marzo", 4: "Aprile",
    5: "Maggio", 6: "Giugno", 7: "Luglio", 8: "Agosto",
    9: "Settembre", 10: "Ottobre", 11: "Novembre", 12: "Dicembre",
}


def monthly_amount(item, year: int, month: int) -> float:
    """Return the amount attributable to a given month for any income/expense item."""
    target = date(year, month, 1)

    if item.is_recurring:
        if item.start_date:
            if target < item.start_date.replace(day=1):
                return 0.0
        if item.end_date:
            if target > item.end_date.replace(day=1):
                return 0.0
        if item.frequency == "monthly":
            return item.amount
        elif item.frequency == "annual":
            return item.amount / 12
    else:
        if item.date and item.date.year == year and item.date.month == month:
            return item.amount

    return 0.0


def count_months(start: date, end: date) -> int:
    """Number of months between two dates (inclusive)."""
    return max(0, (end.year - start.year) * 12 + (end.month - start.month) + 1)
