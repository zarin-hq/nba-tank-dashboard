"""
NBA Lottery simulation using 2019+ rules.
Bottom 3 teams each get 140/1000 combinations (14% each for pick #1).
Top 4 picks are lotteried; picks 5-14 go in reverse standings order.
"""
import random
from typing import Dict, List

# Official NBA lottery combination counts by slot (slot 1 = worst record)
SLOT_COMBINATIONS = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5]
TOTAL_COMBINATIONS = sum(SLOT_COMBINATIONS)  # 1000
N_SLOTS = len(SLOT_COMBINATIONS)

# Precompute cumulative ranges for fast lookup: (start, end, slot_1indexed)
_CUM_RANGES: List[tuple] = []
_c = 0
for _i, _combos in enumerate(SLOT_COMBINATIONS):
    _CUM_RANGES.append((_c + 1, _c + _combos, _i + 1))
    _c += _combos


def _simulate_one() -> List[int]:
    """Run one lottery draw. Returns 4 winning slot numbers (1-indexed)."""
    picked: List[int] = []
    while len(picked) < 4:
        r = random.randint(1, TOTAL_COMBINATIONS)
        for start, end, slot in _CUM_RANGES:
            if start <= r <= end:
                if slot not in picked:
                    picked.append(slot)
                break
    return picked


def run_simulation(n_sims: int = 100_000) -> Dict[int, Dict[int, float]]:
    """
    Simulate the lottery n_sims times.
    Returns {slot: {pick_number: percentage}} for all 14 slots.
    """
    # pick_counts[slot][pick] = raw count
    pick_counts: Dict[int, Dict[int, int]] = {
        slot: {pick: 0 for pick in range(1, N_SLOTS + 1)}
        for slot in range(1, N_SLOTS + 1)
    }

    for _ in range(n_sims):
        lottery_picks = _simulate_one()  # 4 slot numbers that won picks 1-4

        non_lottery = [s for s in range(1, N_SLOTS + 1) if s not in lottery_picks]

        for slot in range(1, N_SLOTS + 1):
            if slot in lottery_picks:
                pick_num = lottery_picks.index(slot) + 1
            else:
                pick_num = 5 + non_lottery.index(slot)
            pick_counts[slot][pick_num] += 1

    return {
        slot: {pick: round(pick_counts[slot][pick] / n_sims * 100, 2) for pick in range(1, N_SLOTS + 1)}
        for slot in range(1, N_SLOTS + 1)
    }


def top4_from_results(slot: int, results: Dict[int, Dict[int, float]]) -> float:
    slot_data = results.get(slot, {})
    return round(sum(slot_data.get(p, 0.0) for p in [1, 2, 3, 4]), 1)
