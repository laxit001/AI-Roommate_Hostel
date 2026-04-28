from app.models.laundry import LaundryModel
import pymysql

class LaundryService:
    # Defining an internal configuration mapping valid daily machine blocks
    STANDARD_SLOTS = [
        "08:00 AM", "10:00 AM", "12:00 PM",
        "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"
    ]

    @staticmethod
    def get_available_slots(booking_date):
        # Scan natively inside our MySQL block matching the isolated valid subset
        booked_times = LaundryModel.get_booked_slots(booking_date)
        
        availability_map = []
        for slot in LaundryService.STANDARD_SLOTS:
            availability_map.append({
                "time": slot,
                "available": slot not in booked_times
            })
        return availability_map

    @staticmethod
    def get_user_bookings(user_id):
        bookings = LaundryModel.get_user_bookings(user_id)
        for b in bookings:
            b['booking_date'] = b['booking_date'].strftime('%Y-%m-%d')
            b['booked_at'] = b['booked_at'].strftime('%Y-%m-%d %H:%M:%S')
        return bookings

    @staticmethod
    def book_slot(user_id, booking_date, slot_time):
        if slot_time not in LaundryService.STANDARD_SLOTS:
            raise ValueError(f"Invalid matching interval structure. Permitted slots are {LaundryService.STANDARD_SLOTS}")
            
        try:
            booking_id = LaundryModel.create_booking(user_id, booking_date, slot_time)
            return {"booking_id": booking_id, "status": "booked", "qr_payload": f"{booking_id}_{user_id}"}
        except pymysql.err.IntegrityError:
            raise ValueError("Time overlap collision: This specific machine slot has just been locked.")

    @staticmethod
    def scan_qr_reservation(booking_id, user_id):
        # Ensure UUID authenticity mapping
        record = LaundryModel.get_booking_by_id(booking_id)
        if not record:
            raise ValueError("Counterfeit reservation payload: No such ticket block exists.")
            
        if int(record['user_id']) != int(user_id):
            raise ValueError("Imposter alert: Machine ticket ID strictly belongs to a different student entity!")
            
        if record['status'] == 'scanned' or record['status'] == 'completed':
            return {"message": "Already utilized", "booking_id": booking_id, "current_status": record['status']}
            
        # Complete success path update logic
        LaundryModel.update_booking_status(booking_id, 'scanned')
        return {"message": "Success! Unlock cycle started", "booking_id": booking_id, "current_status": "scanned"}
