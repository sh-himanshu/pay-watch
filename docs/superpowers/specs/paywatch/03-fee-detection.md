# PayWatch — Fee Detection Engine

**Source:** `2026-03-27-paywatch-design.md` section 5
**Status:** Approved

---

Runs after each new bill is inserted. Three detection strategies:

## Price Increase Detection

```
Compare bill.amount against biller.typical_amount
If amount > typical_amount * 1.05 (5% threshold):
  -> Create alert: type="price_increase", severity="warning"
  -> metadata: { previous_amount, new_amount, percent_change }
  -> If percent_change > 20%: severity="urgent"
```

After alert is created, update `biller.typical_amount` with a rolling average of the last 6 bills.

## Unexpected Charge Detection

```
For each new bill:
  Check if amount contains known fee keywords in source email:
    "late fee", "service charge", "convenience fee", "foreign transaction"
  OR if bill amount deviates > 2 standard deviations from biller history
  -> Create alert: type="unexpected_charge", severity="warning"
  -> metadata: { expected_range, actual_amount, reason }
```

## New Biller Detection

```
On biller upsert, if biller.first_seen_at == now():
  -> Create alert: type="new_biller", severity="info"
  -> metadata: { biller_name, first_amount, source_email }
```
