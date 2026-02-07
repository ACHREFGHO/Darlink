from datetime import datetime, timedelta
from typing import List, Optional, Dict
from abc import ABC, abstractmethod
import math

# 1. Data Models & Entities

class Property(ABC):
    """Base class for all property types."""
    def __init__(self, property_id: str, name: str, location: str, base_price: float):
        self.id = property_id
        self.name = name
        self.location = location
        self.base_price = base_price

    @abstractmethod
    def get_type(self) -> str:
        pass

class UniqueHouse(Property):
    """A stand-alone house with strict 1-to-1 availability."""
    def __init__(self, property_id: str, name: str, location: str, base_price: float, cleaning_buffer_hours: int = 24):
        super().__init__(property_id, name, location, base_price)
        self.cleaning_buffer_hours = cleaning_buffer_hours

    def get_type(self) -> str:
        return "UNIQUE_HOUSE"

class PropertyCenter(Property):
    """An apartment center or guest house with multiple identical units."""
    def __init__(self, property_id: str, name: str, location: str, base_price: float, total_inventory: int):
        super().__init__(property_id, name, location, base_price)
        self.total_inventory = total_inventory

    def get_type(self) -> str:
        return "PROPERTY_CENTER"

class Reservation:
    """Represents a guest reservation."""
    def __init__(self, reservation_id: str, guest_id: str, property_id: str, 
                 check_in: datetime, check_out: datetime, status: str = "CONFIRMED"):
        if check_out <= check_in:
            raise ValueError("Check-out must be after Check-in.")
        
        self.id = reservation_id
        self.guest_id = guest_id
        self.property_id = property_id
        self.check_in = check_in
        self.check_out = check_out
        self.status = status

# 2. The Availability Logic (The "Engine")

class AvailabilityEngine:
    """Core logic to determine if a property can be booked."""
    
    @staticmethod
    def is_available(property_obj: Property, start_date: datetime, end_date: datetime, 
                     existing_reservations: List[Reservation]) -> bool:
        
        # Basic validation
        if end_date <= start_date:
            return False

        if isinstance(property_obj, UniqueHouse):
            return AvailabilityEngine._check_unique_house(property_obj, start_date, end_date, existing_reservations)
        
        elif isinstance(property_obj, PropertyCenter):
            return AvailabilityEngine._check_property_center(property_obj, start_date, end_date, existing_reservations)
        
        return False

    @staticmethod
    def _check_unique_house(house: UniqueHouse, requested_in: datetime, requested_out: datetime, 
                            reservations: List[Reservation]) -> bool:
        # Buffer Logic: Inject cleaning window
        buffer_timedelta = timedelta(hours=house.cleaning_buffer_hours)
        
        for res in reservations:
            if res.status != "CONFIRMED":
                continue
            
            # Apply buffer to existing reservation's checkout
            buffered_checkout = res.check_out + buffer_timedelta
            # Also apply buffer to the requested checkout (or checkin) if we want absolute isolation
            # The logic usually is: Res_Start < Requested_End AND Res_End_With_Buffer > Requested_Start
            
            if (res.check_in < requested_out) and (buffered_checkout > requested_in):
                return False
        return True

    @staticmethod
    def _check_property_center(center: PropertyCenter, requested_in: datetime, requested_out: datetime, 
                               reservations: List[Reservation]) -> bool:
        # Calculate Peak Occupancy during requested dates
        # We check every day in the range to find the day with the highest number of bookings
        
        current_day = requested_in
        while current_day < requested_out:
            day_occupancy = 0
            for res in reservations:
                if res.status != "CONFIRMED":
                    continue
                # If the day falls within the reservation period
                if res.check_in <= current_day < res.check_out:
                    day_occupancy += 1
            
            if day_occupancy >= center.total_inventory:
                return False # Full on at least one day
            
            current_day += timedelta(days=1)
            
        return True

# 3. Workflow Implementation

class SoftLockManager:
    """Mock Redis-based Soft Lock for race condition prevention."""
    def __init__(self):
        self._locks: Dict[str, datetime] = {} # Key: property_id:date_range -> expiry

    def acquire_lock(self, property_id: str, start: datetime, end: datetime, duration_minutes: int = 15) -> bool:
        lock_key = f"{property_id}:{start.isoformat()}-{end.isoformat()}"
        now = datetime.now()
        
        # Clean expired locks
        self._locks = {k: v for k, v in self._locks.items() if v > now}
        
        if lock_key in self._locks:
            return False # Already locked
        
        self._locks[lock_key] = now + timedelta(minutes=duration_minutes)
        return True

class ReservationService:
    """Service layer handling the Reservation Lifecycle."""
    
    def __init__(self, db_session=None):
        self.lock_manager = SoftLockManager()
        self.db = db_session # Mock DB session

    def request_reservation(self, property_obj: Property, guest_id: str, 
                            start: datetime, end: datetime, 
                            existing_reservations: List[Reservation]) -> Optional[str]:
        """Phase 1 & 2: Check & Lock."""
        
        # 1. Engine check
        if not AvailabilityEngine.is_available(property_obj, start, end, existing_reservations):
            print(f"Property {property_obj.id} is not available for requested dates.")
            return None
        
        # 2. Soft Locking (15 min)
        if not self.lock_manager.acquire_lock(property_obj.id, start, end):
            print("Reservation is currently being processed by another user.")
            return None
        
        print(f"Soft lock acquired for {guest_id} on {property_obj.name}.")
        return "PENDING_LOCK_ID_123"

    def confirm_reservation(self, lock_id: str, property_obj: Property, 
                            guest_id: str, start: datetime, end: datetime) -> Reservation:
        """Phase 3: Database write after payment verification."""
        # In a real system, you would verify payment here.
        new_res = Reservation(
            reservation_id=f"RES-{math.floor(datetime.now().timestamp())}",
            guest_id=guest_id,
            property_id=property_obj.id,
            check_in=start,
            check_out=end
        )
        print(f"Reservation {new_res.id} confirmed for {guest_id}.")
        return new_res

# Example Usage
if __name__ == "__main__":
    # Setup
    house = UniqueHouse("H1", "Villa Azure", "Sidi Bou Said", 500.0)
    center = PropertyCenter("C1", "Darlink Apartments", "Tunis", 150.0, total_inventory=5)
    
    service = ReservationService()
    
    # Dates
    check_in = datetime(2026, 6, 1, 14, 0)
    check_out = datetime(2026, 6, 5, 11, 0)
    
    # 1. Test Unique House Availability
    existing_res = [
        Reservation("R0", "G1", "H1", datetime(2026, 5, 30), datetime(2026, 6, 1))
    ]
    
    # This should fail if buffer is 24h (R0 ends at June 1, New starts at June 1)
    status = service.request_reservation(house, "G2", check_in, check_out, existing_res)
    if not status:
        print("Correct: Prevented booking due to cleaning window.")

    # 2. Test Property Center
    center_res = [
        Reservation(f"RC{i}", "GX", "C1", datetime(2026, 6, 1), datetime(2026, 6, 5)) 
        for i in range(5)
    ]
    # Center is full
    status = service.request_reservation(center, "G3", check_in, check_out, center_res)
    if not status:
        print("Correct: Center is at peak occupancy.")
