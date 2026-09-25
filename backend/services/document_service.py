from typing import Dict

def calculate_print_costs(
    pages: int,
    copies: int,
    paper: str,
    color: str,
    duplex: str,
    priority: str
) -> Dict[str, float]:
    total_sides = max(1, pages) * max(1, copies)
    base_rate = 0.10

    if paper == "A4":
        base_rate = 0.40 if color == "Color" else 0.10
    elif paper == "A3":
        base_rate = 0.80 if color == "Color" else 0.25
    elif paper == "Letter":
        base_rate = 0.35 if color == "Color" else 0.10

    total_cost = total_sides * base_rate
    if duplex == "Double-sided":
        total_cost *= 0.90  # 10% eco discount
    if priority == "Priority":
        total_cost += 1.50  # Priority surcharge

    return {
        "total_prints": total_sides,
        "estimated_cost": round(total_cost, 2)
    }
