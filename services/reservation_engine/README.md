# Reservation & Availability Engine (Antigravity Core)

This directory contains the Python-based implementation of a robust reservation and availability engine designed for real-world property management scenarios.

## Core Architecture

### 1. Unified Property Models
The system distinguishes between two fundamental behaviors:
- **`UniqueHouse`**: Represents a single, unique unit (e.g., a villa). It follows a strict 1-to-1 availability rule with an integrated **Cleaning Buffer** (default 24h) to ensure turnover time.
- **`PropertyCenter`**: Represents a multi-unit complex (e.g., apartments or guest houses). It handles **Inventory-based availability**, allowing multiple concurrent bookings up to a defined `total_inventory` limit.

### 2. High-Performance Availability Engine
The `AvailabilityEngine` implements optimized date-range overlap logic:
- **Unique Logic**: `(CheckIn < RequestedOut) AND (CheckOut + Buffer > RequestedIn)`
- **Grouped Logic**: Implements "Peak Occupancy" calculation by iterating through the stay window and verifying inventory levels for every individual day.

### 3. Service Layer Workflow
The engine follows a 3-phase lifecycle to prevent overbooking:
1. **Request**: Initial validation against historical data.
2. **Locking**: Acquisition of a "Soft Lock" (simulating a Redis implementation) valid for 15 minutes. This prevents "double-clicking" and race conditions during the payment page stay.
3. **Confirmation**: Final state persistence after external confirmation (e.g., payment success).

## Technical Requirements & Optimizations
- **Language**: Python 3.x
- **Date Handling**: Uses native `datetime` ISO-8601 comparisons.
- **Buffer Management**: Configurable turnover windows per unique property.
- **Validation**: Enforced integrity checks for Check-in < Check-out.

## Implementation Snippet
```python
from services.reservation_engine.engine import ReservationService, UniqueHouse
# ... initialize models and check availability
```
